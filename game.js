
//canvas
let canvas;
let canvasWidth = 450;
let canvasHeight = 671;
let context;
//ses dosyları
var fly = new Audio();
var skor = new Audio();
var negatifskor = new Audio();

fly.src = "sounds/fly.mp3";
skor.src = "sounds/skor.mp3";
negatifskor.src = "sounds/negatif.mp3";

//ghost
let ghostWidth = 45; //width/height oranı = 45/55
let ghostHeight = 55;
let ghostX = canvasWidth / 8;
let ghostY = canvasHeight / 2;
let ghostImg;

let ghost = {
    x: ghostX,
    y: ghostY,
    width: ghostWidth,
    height: ghostHeight
}

//kütükler
let woodArray = [];
let woodWidth = 64; //width/height oranı 1/8
let woodHeight = 512;
let woodX = canvasWidth;
let woodY = 0;

let ustWoodImg;
let altWoodImg;

//bal kabakları
let pumpkinImg;

let pumpkinArray = [];
let pumpkinWidth = 20; //width/height oranı = 1
let pumpkinHeight = 20;
let pumpkinX = canvasWidth;
let pumpkinY = 0;

let pumpkin2Img;

//zehirli bal kabakları
let pumpkin2Array = [];
let pumpkin2Width = 20; //width/height oranı = 1
let pumpkin2Height = 20;
let pumpkin2X = canvasWidth;
let pumpkin2Y = 0;

//oyun fiziği
let velocityX = -1.8; //oyunun ilerleyiş hızı
let velocityY = 0; //ghost zıplama hızı
let gravity = 0.18; //yer çekimi

let gameOver = false;
let score = 0;

//canvas
window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    context = canvas.getContext("2d");

    //resimleri yükle
    //hayalet çizimi
    ghostImg = new Image();
    ghostImg.src = "images/ghost.png";
    ghostImg.onload = function () {
        context.drawImage(ghostImg, ghost.x, ghost.y, ghost.width, ghost.height);
    }

    ustWoodImg = new Image();
    ustWoodImg.src = "images/wood1.png";

    altWoodImg = new Image();
    altWoodImg.src = "images/wood2.png";

    pumpkinImg = new Image();
    pumpkinImg.src = "images/pumpkin.png";

    pumpkin2Img = new Image();
    pumpkin2Img.src = "images/pumpkin2.png";

    requestAnimationFrame(game);
    setInterval(kutuk_ekle, 1500); //her 1.5 saniyede 
    setInterval(balKabagiEkle, 1000); //her 1 saniyede 
    setInterval(balKabagiEkle2, 1200); //her 1.2 saniyede 
    document.addEventListener("keydown", moveGhost);
}


function game() {
    //oyun basladığında müzik çal.
    fly.play();
    requestAnimationFrame(game);
    //oyun biterse müziği durdur.
    if (gameOver) {
        fly.pause()
        return;
    }
    //oyun ilerledikçe çizimlerin üst üste gelmesini engeller.
    context.clearRect(0, 0, canvas.width, canvas.height);

    //ghost
    velocityY += gravity;

    ghost.y = Math.max(ghost.y + velocityY, 0); //ghost'a yerçekimi uygular ve en fazla ekran dışına çıkmasını engelle.
    context.drawImage(ghostImg, ghost.x, ghost.y, ghost.width, ghost.height);

    //ghost canvas dışına çıkarsa oyunu bitir.
    if (ghost.y > canvas.height) {
        gameOver = true;
    }

    //kütük
    for (let i = 0; i < woodArray.length; i++) {
        let wood = woodArray[i];
        wood.x += velocityX;
        context.drawImage(wood.img, wood.x, wood.y, wood.width, wood.height);

        if (!wood.passed && ghost.x > wood.x + wood.width) {
            score += 0.5; //2 kütük arasından geçince 0.5x2 = 1 puan
            wood.passed = true;
            skor.play();//skor aldığında skor müziği çal
        }
        //oturum boyunca yüksek skoru saklamak için sessionStorage kullan.
        var yuksekSkor = sessionStorage.getItem("yuksekSkor") || 0;
        // yeni skor mevcut yüksek skordan büyükse güncelle.
        if (score > yuksekSkor) {
            yuksekSkor = score;

            // Yüksek skoru sessionStorage'a kaydet.
            sessionStorage.setItem("yuksekSkor", yuksekSkor);
        }
        if (carpismaVarmi(ghost, wood)) {
            gameOver = true;
        }
    }


    //ekrandan çıkan kütükleri sil
    while (woodArray.length > 0 && woodArray[0].x < -woodWidth) {
        woodArray.shift(); 
    }



    //bal kabağı
    for (let i = 0; i < pumpkinArray.length; i++) {
        let pumpkin = pumpkinArray[i];
        pumpkin.x += velocityX;
        context.drawImage(pumpkin.img, pumpkin.x, pumpkin.y, pumpkin.width, pumpkin.height);

        //ghost bal kabağına temas ederse
        if (carpismaVarmi(ghost, pumpkin)) {
            pumpkinArray.splice(i, 1);//bal kabağını sil
            score += 1;// 1 puan ekle
            skor.play();//skor müziği çal
        }
        var yuksekSkor = sessionStorage.getItem("yuksekSkor") || 0;
        if (score > yuksekSkor) {
            yuksekSkor = score;

            // Yüksek skoru sessionStorage'a kaydet.
            sessionStorage.setItem("yuksekSkor", yuksekSkor);
        }

    }
    //ekrandan çıkan bal kabaklarını sil
    while (pumpkinArray.length > 0 && pumpkinArray[0].x < -pumpkinWidth) {
        pumpkinArray.shift();
    }

    //zehirli bal kabağı
    for (let i = 0; i < pumpkin2Array.length; i++) {
        let pumpkin2 = pumpkin2Array[i];
        pumpkin2.x += velocityX;
        context.drawImage(pumpkin2.img, pumpkin2.x, pumpkin2.y, pumpkin2.width, pumpkin2.height);

        //ghost zehirli bal kabağına temas ederse
        if (carpismaVarmi(ghost, pumpkin2)) {
            pumpkin2Array.splice(i, 1);//bal kabağını sil
            score -= 1;// 1 puan azalt
            negatifskor.play();// negatif skor müziği çal
        }
        
        var yuksekSkor = sessionStorage.getItem("yuksekSkor") || 0;
        if (score > yuksekSkor) {
            yuksekSkor = score;

            // Yüksek skoru sessionStorage'a kaydet.
            sessionStorage.setItem("yuksekSkor", yuksekSkor);
        }

    }
    //zehirli bal kabağı ekrandan çıkarsa sil
    while (pumpkin2Array.length > 0 && pumpkin2Array[0].x < -pumpkin2Width) {
        pumpkin2Array.shift();
    }




    //skor
    context.fillStyle = "white";
    context.font = "45px Lucida Handwriting";
    context.fillText(score, 5, 45);


    if (gameOver) {
        context.fillText("OYUN BiTTİ", 80, 335);
        context.font = "20px Lucida Handwriting";
        var heighscore = "yüksek skor:";
        context.fillText(heighscore, 140, 360);
        context.fillText(yuksekSkor, 280, 360);
        context.font = "45px Lucida Handwriting";
    }
}
//kütük ekle fonksiyonu
function kutuk_ekle() {
    if (gameOver) {
        return;
    }

    let randomWoodY = woodY - woodHeight / 4 - Math.random() * (woodHeight / 2);
    let openingSpace = canvas.height / 3.5; //kütükler arası geçiş boşluğu

    let ustWood = {
        img: ustWoodImg,
        x: woodX,
        y: randomWoodY,
        width: woodWidth,
        height: woodHeight,
        passed: false
    }
    woodArray.push(ustWood);

    let altWood = {
        img: altWoodImg,
        x: woodX,
        y: randomWoodY + woodHeight + openingSpace,
        width: woodWidth,
        height: woodHeight,
        passed: false
    }
    woodArray.push(altWood);
}

//balKabagi ekle fonksiyonu
function balKabagiEkle() {
    //rastgele x-y değişkenleri oluşturur 
    let randomPumpkinY = Math.random() * (canvasWidth);
    let randomPumpkinX = Math.random() * (canvasWidth)+ 400;//+400 ün sebebi ekranda aniden belirmesini engellemek için.
    let openingSpace = canvas.height / 3;
    let pumpkin = {
        img: pumpkinImg,
        x: randomPumpkinX + pumpkinHeight + openingSpace,
        y: randomPumpkinY + pumpkinHeight + openingSpace,
        width: pumpkinWidth,
        height: pumpkinHeight,
        passed: false
    }
    pumpkinArray.push(pumpkin);
}
//zehirli balKabagi ekle fonksiyonu
function balKabagiEkle2() {
    //rastgele x-y değişkenleri oluşturur 
    let randomPumpkin2Y = Math.random() * (canvasWidth);
    let randomPumpkin2X = Math.random() * (canvasWidth)+ 400;//+400 ün sebebi ekranda aniden belirmesini engellemek için.
    let openingSpace = canvas.height / 3; 
    let pumpkin2 = {
        img: pumpkin2Img,
        x: randomPumpkin2X + pumpkin2Height + openingSpace,
        y: randomPumpkin2Y + pumpkin2Height + openingSpace,
        width: pumpkin2Width,
        height: pumpkin2Height,
        passed: false
    }
    pumpkin2Array.push(pumpkin2);
}

//ghostun hareket fonksiyonu
function moveGhost(e) {
    // space-yukarı tuşu - w tuşundan herhangi birine basılırsa
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyW") {
        //zıplama
        velocityY = -5;

        //oyunu baştan başlat
        if (gameOver) {
            ghost.y = ghostY;
            woodArray = [];
            score = 0;//skoru sıfırla
            gameOver = false;
        }
        
    }
}
// iki cismin birbirine teması olup olmamasını kontrol eder.
function carpismaVarmi(a, b) {
    return a.x < b.x + b.width &&   a.x + a.width > b.x &&   a.y < b.y + b.height &&  a.y + a.height > b.y;
}

