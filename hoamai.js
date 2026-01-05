const style = document.createElement('style');
style.innerHTML = `
    .card { position: relative !important; overflow: hidden !important; z-index: 1; }
    #flower-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .card > *:not(#flower-canvas) { position: relative; z-index: 2; }
`;
document.head.appendChild(style);

window.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    if (card) {
        const canvas = document.createElement('canvas');
        canvas.id = 'flower-canvas';
        card.prepend(canvas);
        const ctx = canvas.getContext('2d');
        let flowers = [];
        let staticFlowers = []; // Danh sách hoa cố định ở nền
        let obstacles = [];

        function updateObstacles() {
            obstacles = [];
            // Quét tất cả: Tiêu đề, Nhãn (label), Ô nhập, Nút bấm, và các hộp thông báo
            const elements = card.querySelectorAll('h2, label, input, button, .success-box, p, .nav-menu, span');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) { // Chỉ lấy các phần tử đang hiển thị
                    obstacles.push({
                        left: rect.left - cardRect.left,
                        right: rect.right - cardRect.left,
                        top: rect.top - cardRect.top,
                        bottom: rect.bottom - cardRect.top,
                        id: Math.random()
                    });
                }
            });
        }

        function resize() {
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
            updateObstacles();
            createStaticFlowers(); // Tạo lại hoa nền khi đổi kích thước
        }
        window.addEventListener('resize', resize);

        // Hàm vẽ bông hoa mai dùng chung
        function drawFlower(x, y, size, rotation, alpha = 1) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(x, y);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.fillStyle = "#FFD700"; 
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(0, -size/2, size/1.5, size, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.rotate((72 * Math.PI) / 180);
            }
            ctx.beginPath(); 
            ctx.arc(0, 0, size/2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#FF8C00"; 
            ctx.fill();
            ctx.restore();
        }

        // Tạo 3-4 bông hoa nằm cố định ở các góc cho đẹp
        function createStaticFlowers() {
            staticFlowers = [
                { x: 20, y: 20, size: 8, rot: 45, alpha: 0.6 },
                { x: canvas.width - 30, y: 100, size: 6, rot: 120, alpha: 0.4 },
                { x: 40, y: canvas.height - 80, size: 7, rot: 10, alpha: 0.5 },
                { x: canvas.width - 50, y: canvas.height - 40, size: 9, rot: 200, alpha: 0.6 }
            ];
        }

        class FallingFlower {
            constructor(initialWait) { 
                this.initialWait = initialWait;
                this.reset(true); 
            }
            reset(isFirstTime = false) {
                this.x = Math.random() * canvas.width;
                this.y = isFirstTime ? -Math.random() * canvas.height * 1.5 - 50 : -30;
                this.size = Math.random() * 5 + 4;
                this.speedY = Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.2 - 0.1;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.hasBouncedOn = null;
            }
            update() {
                if (this.initialWait > 0) { this.initialWait--; return; }
                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;

                obstacles.forEach(ob => {
                    if (nextX > ob.left && nextX < ob.right && 
                        (nextY + this.size) > ob.top && (nextY + this.size) < ob.bottom && 
                        (this.y + this.size) <= ob.top && this.hasBouncedOn !== ob.id) {
                        this.speedY = -1.2; 
                        this.speedX = (Math.random() - 0.5) * 0.4;
                        this.hasBouncedOn = ob.id;
                        this.y = ob.top - this.size - 1; 
                    }
                });

                if (this.speedY < 0.6) this.speedY += 0.04; 
                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.spin;
                if (this.x < 0) this.x = 0;
                if (this.x > canvas.width) this.x = canvas.width;
                if (this.y > canvas.height) this.reset();
            }
            draw() {
                if (this.initialWait > 0 || this.y < -this.size * 2) return;
                drawFlower(this.x, this.y, this.size, this.rotation);
            }
        }

        // Khởi tạo
        resize();
        for(let i=0; i<25; i++) { 
            flowers.push(new FallingFlower(Math.random() * 400)); 
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 1. Vẽ hoa cố định ở nền trước (mờ hơn)
            staticFlowers.forEach(sf => drawFlower(sf.x, sf.y, sf.size, sf.rot, sf.alpha));
            
            // 2. Vẽ hoa đang rơi và nảy
            flowers.forEach(f => { f.update(); f.draw(); });
            
            requestAnimationFrame(animate);
        }
        animate();
        setInterval(updateObstacles, 2000); 
    }
});
