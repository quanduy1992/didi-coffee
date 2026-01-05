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
            const elements = card.querySelectorAll('h2, input, button, .success-box, p, .nav-menu');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                obstacles.push({
                    left: rect.left - cardRect.left,
                    right: rect.right - cardRect.left,
                    top: rect.top - cardRect.top,
                    bottom: rect.bottom - cardRect.top,
                    id: Math.random()
                });
            });
        }

        function resize() {
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
            updateObstacles();
        }
        window.addEventListener('resize', resize);
        resize();

        class Flower {
            constructor(initialWait) { 
                this.initialWait = initialWait; // Thời gian chờ trước khi xuất hiện lần đầu
                this.reset(true); 
            }
            
            reset(isFirstTime = false) {
                this.x = Math.random() * canvas.width;
                // Nếu là lần đầu, đẩy hoa lên thật cao ngoài màn hình để rơi xuống từ từ
                // Hoặc dùng vị trí âm để tạo độ trễ xuất hiện
                this.y = isFirstTime ? -Math.random() * canvas.height * 1.5 - 50 : -20;
                
                this.size = Math.random() * 5 + 3;
                this.speedY = Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.2 - 0.1;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.hasBouncedOn = null;
            }

            update() {
                // Hoa chỉ rơi xuống nếu đã hết thời gian chờ (initialWait)
                if (this.initialWait > 0) {
                    this.initialWait--;
                    return;
                }

                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;

                obstacles.forEach(ob => {
                    if (nextX > ob.left && nextX < ob.right && 
                        nextY > ob.top && nextY < ob.bottom && 
                        this.y <= ob.top && this.hasBouncedOn !== ob.id) {
                        
                        this.speedY = -1.2; 
                        this.speedX = (Math.random() - 0.5) * 0.4;
                        this.hasBouncedOn = ob.id;
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
                if (this.initialWait > 0 || this.y < -this.size) return;
                
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.fillStyle = "#FFD700"; 
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.ellipse(0, -this.size, this.size/1.5, this.size, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.rotate((72 * Math.PI) / 180);
                }
                ctx.beginPath(); ctx.arc(0, 0, this.size/2.5, 0, Math.PI * 2);
                ctx.fillStyle = "#FF8C00"; ctx.fill();
                ctx.restore();
            }
        }

        // Tạo 8 bông hoa với thời gian chờ (delay) ngẫu nhiên
        for(let i=0; i<25; i++) { 
            // Mỗi bông hoa sẽ chờ từ 0 đến 300 khung hình mới bắt đầu rơi
            flowers.push(new Flower(Math.random() * 400)); 
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        setTimeout(updateObstacles, 1000); 
    }
});
