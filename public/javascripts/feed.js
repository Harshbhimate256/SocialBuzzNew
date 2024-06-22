const toggleBtn = document.getElementById('toggle');
const nav = document.getElementById('nav');
const menuIcon = document.getElementById('menu');
const closeIcon = document.getElementById('close');
const main = document.getElementById('main')
const body = document.body;
toggleBtn.addEventListener("click",()=>{
    if(nav.style.left === '0px'){
        toggleBtn.style.backgroundColor = 'lightblue';
        nav.style.left = "-100%";
        closeIcon.style.display = 'none';
        menuIcon.style.display = 'block';
        main.style.opacity = 1;
    }
    else{
        nav.style.left = '0px';
        toggleBtn.style.zIndex = 100;
        closeIcon.style.display = 'block';
        toggleBtn.style.backgroundColor = 'white';
        menuIcon.style.display = 'none';
        main.style.opacity = .5;
    }
});

