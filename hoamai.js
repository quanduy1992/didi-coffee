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
        let obstacles = [];

        function updateObstacles() {
            obstacles = [];
            // Quét tiêu đề, nhãn, ô nhập, nút, hình ảnh trang trí và menu
            const elements = card.querySelectorAll('h2, label, input, button, .success-box, p, .nav-menu, span, img');
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
        }
        window.addEventListener('resize', resize);

        function drawFlower(x, y, size, rotation) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.fillStyle = "#FFD700"; // Màu vàng mai
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(0, -size/2, size/1.5, size, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.rotate((72 * Math.PI) / 180);
            }
            ctx.beginPath(); 
            ctx.arc(0, 0, size/2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#FF8C00"; // Nhụy cam
            ctx.fill();
            ctx.restore();
        }

        class FallingFlower {
            constructor(initialWait) { 
                this.initialWait = initialWait;
                this.reset(true); 
            }
            reset(isFirstTime = false) {
                this.x = Math.random() * canvas.width;
                this.y = isFirstTime ? -Math.random() * canvas.height * 1.5 - 50 : -30;
                this.size = Math.random() * 3 + 4;
                this.speedY = Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.isRolling = false;
                this.hasBouncedOn = null;
            }

            update() {
                if (this.initialWait > 0) { this.initialWait--; return; }

                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;
                let hitAny = false;

                obstacles.forEach(ob => {
                    // Kiểm tra chạm cánh hoa vào vật cản
                    if (nextX > ob.left && nextX < ob.right && 
                        (nextY + this.size) >= ob.top && (nextY + this.size) <= ob.top + 5) {
                        
                        hitAny = true;
                        if (!this.isRolling) {
                            this.speedY = -0.4; // Nảy nhẹ
                            // Lăn về hướng mép gần nhất
                            this.speedX = (this.x < (ob.left + ob.right)/2) ? -0.7 : 0.7;
                            this.isRolling = true;
                        } else {
                            this.y = ob.top - this.size;
                            this.speedY = 0; 
                        }
                    }
                });

                if (!hitAny) {
                    this.isRolling = false;
                    if (this.speedY < 0.7) this.speedY += 0.05; 
                }

                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.spin;

                // Giới hạn biên trái phải của card
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
        // Số lượng hoa rơi (7 bông cho thoáng trang)
        for(let i=0; i<15; i++) { 
            flowers.push(new FallingFlower(Math.random() * 500)); 
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        setInterval(updateObstacles, 3000); 
    }
});
