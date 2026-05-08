#!/bin/bash

# ============================================
# 智能冰箱 PWA 应用部署脚本
# 适用于 Ubuntu 24.04 + Docker + Nginx + SSL
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "请使用 root 用户运行此脚本或添加 sudo"
        exit 1
    fi
}

# 安装 Docker
install_docker() {
    log_info "安装 Docker..."
    
    # 检查 Docker 是否已安装
    if command -v docker &> /dev/null; then
        log_warning "Docker 已安装: $(docker --version)"
    else
        # 安装必要组件
        apt update
        apt install -y ca-certificates curl gnupg lsb-release
        
        # 添加 Docker GPG key
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # 添加 Docker 仓库
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # 安装 Docker
        apt update
        apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
        # 启动 Docker
        systemctl start docker
        systemctl enable docker
        
        log_success "Docker 安装完成"
    fi
    
    # 检查 Docker Compose
    if command -v docker-compose &> /dev/null; then
        log_info "Docker Compose 已安装: $(docker-compose --version)"
    else
        log_info "安装 Docker Compose..."
        apt install -y docker-compose
    fi
}

# 安装 Nginx
install_nginx() {
    log_info "安装 Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_warning "Nginx 已安装: $(nginx -v 2>&1)"
    else
        apt update
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
        log_success "Nginx 安装完成"
    fi
}

# 安装 Certbot
install_certbot() {
    log_info "安装 Certbot..."
    
    if command -v certbot &> /dev/null; then
        log_warning "Certbot 已安装: $(certbot --version)"
    else
        apt update
        apt install -y certbot python3-certbot-nginx
        log_success "Certbot 安装完成"
    fi
}

# 构建应用
build_app() {
    log_info "检查 Node.js..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
        log_success "Node.js 安装完成: $(node --version)"
    else
        log_info "Node.js 已安装: $(node --version)"
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    # 安装依赖
    log_info "安装项目依赖..."
    npm install
    
    # 构建应用
    log_info "构建生产版本..."
    npm run build
    
    # 检查构建结果
    if [ -d "dist" ]; then
        log_success "构建成功！"
        log_info "构建文件位于: $(pwd)/dist"
    else
        log_error "构建失败：dist 目录不存在"
        exit 1
    fi
}

# 部署 Docker 容器
deploy_docker() {
    log_info "部署 Docker 容器..."
    
    # 检查 docker-compose.yml
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml 不存在"
        exit 1
    fi
    
    # 停止旧容器（如果存在）
    docker-compose down 2>/dev/null || true
    
    # 构建并启动新容器
    docker-compose up -d --build
    
    # 等待容器启动
    sleep 5
    
    # 检查容器状态
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker 容器启动成功！"
    else
        log_error "Docker 容器启动失败"
        docker-compose logs
        exit 1
    fi
}

# 配置 Nginx 反向代理
configure_nginx() {
    log_info "配置 Nginx 反向代理..."
    
    # 备份原配置
    if [ -f "/etc/nginx/sites-available/default" ]; then
        cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    fi
    
    # 复制新配置
    cp nginx-ssl.conf /etc/nginx/sites-available/smart-fridge
    
    # 创建符号链接
    ln -sf /etc/nginx/sites-available/smart-fridge /etc/nginx/sites-enabled/smart-fridge
    
    # 移除默认配置
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试 Nginx 配置
    if nginx -t; then
        log_success "Nginx 配置正确"
    else
        log_error "Nginx 配置错误"
        exit 1
    fi
    
    # 重载 Nginx
    systemctl reload nginx
    log_success "Nginx 配置完成"
}

# 配置 SSL 证书
configure_ssl() {
    log_info "配置 SSL 证书..."
    
    # 创建证书目录
    mkdir -p /var/www/certbot
    
    # 申请证书（测试模式）
    log_warning "正在申请 Let's Encrypt 证书..."
    certbot --nginx -d xgamingx.top -d www.xgamingx.top --non-interactive --agree-tos -m admin@xgamingx.top --test-cert || {
        log_info "使用正式证书..."
        certbot --nginx -d xgamingx.top -d www.xgamingx.top --non-interactive --agree-tos -m admin@xgamingx.top
    }
    
    # 设置证书自动续期
    echo "0 0 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" >> /etc/cron.d/certbot-renew
    
    log_success "SSL 证书配置完成"
    log_info "证书位置: /etc/letsencrypt/live/xgamingx.top/"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 检查 ufw 是否安装
    if command -v ufw &> /dev/null; then
        # 开放必要端口
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        
        # 启用防火墙
        echo "y" | ufw enable
        
        log_success "防火墙配置完成"
    else
        log_warning "防火墙未安装，跳过配置"
    fi
}

# 显示部署信息
show_info() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo "=========================================="
    echo ""
    echo -e "${BLUE}访问地址：${NC}"
    echo "  https://xgamingx.top"
    echo "  https://www.xgamingx.top"
    echo ""
    echo -e "${BLUE}Docker 容器状态：${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}常用命令：${NC}"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  更新应用: ./deploy.sh update"
    echo ""
    echo -e "${BLUE}SSL 证书：${NC}"
    echo "  证书位置: /etc/letsencrypt/live/xgamingx.top/"
    echo "  自动续期: 已配置（每天 0:00 自动检查）"
    echo ""
    echo "=========================================="
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🧊 智能冰箱 PWA 应用部署脚本${NC}"
    echo "=========================================="
    echo ""
    
    # 检查 root 权限
    check_root
    
    # 切换到项目目录
    cd "$(dirname "$0")"
    PROJECT_DIR=$(pwd)
    log_info "项目目录: $PROJECT_DIR"
    
    # 安装依赖
    read -p "是否安装 Docker 和 Nginx？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_docker
        install_nginx
        install_certbot
    fi
    
    # 构建应用
    read -p "是否构建应用？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_app
    fi
    
    # 部署 Docker
    read -p "是否部署 Docker 容器？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_docker
    fi
    
    # 配置 Nginx
    read -p "是否配置 Nginx 反向代理？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_nginx
    fi
    
    # 配置 SSL
    read -p "是否配置 SSL 证书？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_ssl
    fi
    
    # 配置防火墙
    read -p "是否配置防火墙？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        configure_firewall
    fi
    
    # 显示部署信息
    show_info
}

# 更新函数
update() {
    log_info "更新应用..."
    
    cd "$(dirname "$0")"
    
    # 构建应用
    npm run build
    
    # 重新部署
    docker-compose up -d --build
    
    log_success "更新完成！"
}

# 根据参数执行
case "$1" in
    update)
        update
        ;;
    *)
        main
        ;;
esac
