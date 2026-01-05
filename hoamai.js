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
                    id: Math.random() // Định danh để mỗi hoa chỉ nảy 1 lần trên 1 vật cản
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
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -20;
                this.size = Math.random() * 5 + 3;
                this.speedY = Math.random() * 0.4 + 0.3; // Rơi chậm
                this.speedX = Math.random() * 0.2 - 0.1; // Lắc ngang rất nhẹ
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.hasBouncedOn = null; // Lưu vật cản vừa nảy để không nảy lại ngay lập tức
            }
            update() {
                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;

                // Kiểm tra va chạm
                obstacles.forEach(ob => {
                    // Nếu chạm vào vùng vật cản và chưa từng nảy trên vật cản này
                    if (nextX > ob.left && nextX < ob.right && 
                        nextY > ob.top && nextY < ob.bottom && 
                        this.y <= ob.top && this.hasBouncedOn !== ob.id) {
                        
                        this.speedY = -1.5; // Nảy ngược lên một chút
                        this.speedX = (Math.random() - 0.5) * 0.5; // Văng ngang rất ít
                        this.hasBouncedOn = ob.id; // Đánh dấu đã nảy xong
                    }
                });

                // Trọng lực kéo xuống lại sau khi nảy
                if (this.speedY < 0.6) this.speedY += 0.05; 

                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.spin;

                // Giữ hoa trong phạm vi màn hình ngang
                if (this.x < 0) this.x = 0;
                if (this.x > canvas.width) this.x = canvas.width;

                if (this.y > canvas.height) this.reset();
            }
            draw() {
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

        // Tạo 8 bông hoa cho thanh thoát
        for(let i=0; i<25; i++) { flowers.push(new Flower()); }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        setTimeout(updateObstacles, 1000); 
    }
});
