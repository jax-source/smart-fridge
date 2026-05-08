# 智能冰箱 PWA 应用部署说明

## 📋 部署流程

### 方式一：自动部署（推荐）

1. **上传项目到服务器**
```bash
scp -r ./workspace/deploy root@112.126.85.181:/root/smart-fridge
```

2. **在服务器上执行部署脚本**
```bash
cd /root/smart-fridge
chmod +x deploy.sh
./deploy.sh
```

### 方式二：手动部署

#### 步骤 1：安装依赖
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash

# 安装 Nginx
apt update && apt install nginx -y

# 安装 Certbot
apt install certbot python3-certbot-nginx -y
```

#### 步骤 2：构建项目
```bash
cd /root/smart-fridge

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装依赖并构建
npm install
npm run build
```

#### 步骤 3：启动 Docker 容器
```bash
cd /root/smart-fridge
docker-compose up -d
```

#### 步骤 4：配置 Nginx 反向代理
```bash
# 复制配置
cp nginx-ssl.conf /etc/nginx/sites-available/smart-fridge
ln -sf /etc/nginx/sites-available/smart-fridge /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重载
nginx -t
systemctl reload nginx
```

#### 步骤 5：配置 SSL 证书
```bash
# 申请 Let's Encrypt 证书
certbot --nginx -d xgamingx.top -d www.xgamingx.top
```

#### 步骤 6：配置自动续期
```bash
# 添加定时任务
echo "0 0 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" >> /etc/cron.d/certbot-renew
```

---

## 🔧 管理命令

### Docker 管理
```bash
cd /root/smart-fridge

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新应用
./deploy.sh update
# 或手动
npm run build
docker-compose up -d --build
```

### Nginx 管理
```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启服务
systemctl restart nginx

# 查看日志
tail -f /var/log/nginx/smart-fridge-access.log
tail -f /var/log/nginx/smart-fridge-error.log
```

### SSL 证书管理
```bash
# 查看证书信息
certbot certificates

# 测试证书续期
certbot renew --dry-run

# 手动续期
certbot renew
```

---

## 🌐 访问地址

部署成功后，访问：

- **https://xgamingx.top**
- **https://www.xgamingx.top**

---

## 🔒 安全配置

### 防火墙（可选）
```bash
ufw allow 22   # SSH
uffw allow 80  # HTTP
ufw allow 443  # HTTPS
ufw enable
```

### Docker 容器自启动
容器已配置 `restart: unless-stopped`，系统重启后会自动启动。

---

## 📊 监控和维护

### 检查服务状态
```bash
# Docker 容器
docker ps

# Nginx 服务
systemctl status nginx

# Docker 服务
systemctl status docker
```

### 日志位置
- **应用日志**: `docker-compose logs -f`
- **Nginx 访问日志**: `/var/log/nginx/smart-fridge-access.log`
- **Nginx 错误日志**: `/var/log/nginx/smart-fridge-error.log`
- **Certbot 日志**: `/var/log/letsencrypt/letsencrypt.log`

---

## 🚀 未来扩展

### 添加新项目
```bash
# 创建新项目目录
mkdir /root/docker-apps/新项目

# 配置新的 Docker 容器（使用不同端口）
# 编辑 nginx-ssl.conf 添加新的 upstream
```

### 域名配置
如果将来需要添加更多域名，编辑 `/etc/nginx/sites-available/smart-fridge` 添加新的 server 块。

---

## ❓ 常见问题

### 1. Docker 容器启动失败
```bash
# 查看错误日志
docker-compose logs

# 常见问题：端口被占用
docker-compose down
# 修改 docker-compose.yml 中的端口映射
docker-compose up -d
```

### 2. SSL 证书申请失败
```bash
# 检查域名 DNS 解析
ping xgamingx.top

# 开放 80 端口（Let's Encrypt 需要）
ufw allow 80

# 手动申请证书
certbot certonly --webroot -w /var/www/certbot -d xgamingx.top
```

### 3. 502 Bad Gateway
```bash
# 检查 Docker 容器是否运行
docker ps | grep smart-fridge

# 检查容器健康状态
docker inspect smart-fridge | grep Health

# 重启容器
docker-compose restart
```

---

## 📞 获取帮助

如遇问题，请检查：

1. Docker 容器日志: `docker-compose logs`
2. Nginx 错误日志: `/var/log/nginx/smart-fridge-error.log`
3. SSL 证书状态: `certbot certificates`
4. 防火墙规则: `ufw status`
5. 端口占用: `netstat -tlnp | grep :3000`

---

**祝部署顺利！🎉**
