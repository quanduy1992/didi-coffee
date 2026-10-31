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
        
        // Tải hình ảnh hoa đào chuẩn nét màu hồng cánh sen viền tinh tế
        const flowerImg = new Image();
        // Dùng dữ liệu mã hóa chuẩn hình hoa đào sắc nét, đẹp y như hình mẫu của ông
        flowerImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 10 C68 35 88 52 110 60 C88 68 68 85 60 110 C52 85 32 68 10 60 C32 52 52 35 60 10 Z" fill="%ffb7c5" stroke="%ffffff" stroke-width="2"/><circle cx="60" cy="60" r="18" fill="%ff69b4"/><circle cx="60" cy="60" r="8" fill="%ffffff"/></svg>';

        function updateObstacles() {
            obstacles = [];
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

        class FallingFlower {
            constructor(isInstant) { 
                this.initialWait = isInstant ? 0 : Math.random() * 300; 
                this.reset(true, isInstant); 
            }
            
            reset(isFirstTime = false, isInstant = false) {
                this.x = Math.random() * canvas.width;
                
                if (isFirstTime && isInstant) {
                    this.y = Math.random() * canvas.height;
                } else if (isFirstTime && !isInstant) {
                    this.y = -Math.random() * canvas.height - 50;
                } else {
                    this.y = -30;
                }

                this.size = Math.random() * 8 + 14; // Kích thước hoa to rõ, sắc sảo
                this.speedY = Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.2 - 0.1;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1.5 - 0.75; // Tốc độ xoay nhẹ nhàng
                this.isRolling = false;
                this.rollDistance = 0;
                this.maxRoll = Math.random() * 20 + 15; 
                this.hasBouncedOn = null;
            }

            update() {
                if (this.initialWait > 0) { this.initialWait--; return; }

                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;
                let hitAny = false;

                if (this.rollDistance < this.maxRoll) {
                    obstacles.forEach(ob => {
                        if (nextX > ob.left && nextX < ob.right && 
                            (nextY + this.size) >= ob.top && (nextY + this.size) <= ob.top + 5 &&
                            this.hasBouncedOn !== ob.id) {
                            
                            hitAny = true;
                            if (!this.isRolling) {
                                this.speedY = -0.3;
                                this.speedX = Math.random() > 0.5 ? 0.6 : -0.6; 
                                this.isRolling = true;
                                this.hasBouncedOn = ob.id;
                            } else {
                                this.y = ob.top - this.size;
                                this.speedY = 0; 
                                this.rollDistance += Math.abs(this.speedX);
                            }
                        }
                    });
                }

                if (!hitAny || this.rollDistance >= this.maxRoll) {
                    if (this.isRolling) this.speedX *= 0.5; 
                    this.isRolling = false;
                    if (this.speedY < 0.7) this.speedY += 0.05; 
                    if (!hitAny) this.rollDistance = 0; 
                }

                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.spin;

                if (this.x < 5 || this.x > canvas.width - 5) this.speedX *= -1;
                if (this.y > canvas.height) this.reset();
            }

            draw() {
                if (this.initialWait > 0 || this.y < -this.size * 2) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                // Vẽ chính xác hình ảnh hoa đào sắc nét thay vì code vẽ hình học cứng nhắc
                ctx.drawImage(flowerImg, -this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        resize();
        flowerImg.onload = () => {
            for(let i=0; i<5; i++) { flowers.push(new FallingFlower(true)); }
            for(let i=0; i<5; i++) { flowers.push(new FallingFlower(false)); }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                flowers.forEach(f => { f.update(); f.draw(); });
                requestAnimationFrame(animate);
            }
            animate();
        };
        
        setInterval(updateObstacles, 3000); 
    }
});
