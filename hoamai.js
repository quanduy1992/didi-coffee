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
        let staticFlowers = [];
        let obstacles = [];

        function updateObstacles() {
            obstacles = [];
            const elements = card.querySelectorAll('h2, label, input, button, .success-box, p, .nav-menu, span');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
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
            createStaticFlowers();
        }
        window.addEventListener('resize', resize);

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

        function createStaticFlowers() {
            staticFlowers = [
                { x: 20, y: 20, size: 8, rot: 45, alpha: 0.5 },
                { x: canvas.width - 35, y: 80, size: 6, rot: 110, alpha: 0.4 },
                { x: 30, y: canvas.height - 70, size: 7, rot: 15, alpha: 0.4 }
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
                this.size = Math.random() * 4 + 4;
                this.speedY = Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.isRolling = false; // Trạng thái đang lăn trên bề mặt
                this.hasBouncedOn = null;
            }

            update() {
                if (this.initialWait > 0) { this.initialWait--; return; }

                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;
                let hitAny = false;

                obstacles.forEach(ob => {
                    // Kiểm tra chạm cạnh trên của vật cản
                    if (nextX > ob.left && nextX < ob.right && 
                        (nextY + this.size) >= ob.top && (nextY + this.size) <= ob.top + 5) {
                        
                        hitAny = true;
                        // Nảy cực nhẹ
                        if (!this.isRolling) {
                            this.speedY = -0.5; 
                            // Lực đẩy ngang để tạo hiệu ứng lăn (ngẫu nhiên trái hoặc phải)
                            this.speedX = this.speedX > 0 ? 0.8 : -0.8;
                            this.isRolling = true;
                        } else {
                            // Nếu đang lăn, giữ y bám sát bề mặt
                            this.y = ob.top - this.size;
                            this.speedY = 0; 
                        }
                    }
                });

                if (!hitAny) {
                    this.isRolling = false;
                    // Trọng lực kéo xuống khi không chạm gì
                    if (this.speedY < 0.7) this.speedY += 0.05; 
                }

                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.spin;

                if (this.x < 5) { this.x = 5; this.speedX *= -1; }
                if (this.x > canvas.width - 5) { this.x = canvas.width - 5; this.speedX *= -1; }
                if (this.y > canvas.height) this.reset();
            }

            draw() {
                if (this.initialWait > 0 || this.y < -this.size * 2) return;
                drawFlower(this.x, this.y, this.size, this.rotation);
            }
        }

        resize();
        for(let i=0; i<15; i++) { 
            flowers.push(new FallingFlower(Math.random() * 500)); 
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            staticFlowers.forEach(sf => drawFlower(sf.x, sf.y, sf.size, sf.rot, sf.alpha));
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        setInterval(updateObstacles, 2500); 
    }
});
