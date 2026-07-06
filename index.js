
    // 快取DOM元素
    const track = document.getElementById("carousel");
    const imgs = Array.from(track.children);
    const totalImgs = imgs.length;
    const visibleCount = 5;

    // 狀態變數
    let currentStartIndex = 0;
    let isAnimating = false;
    let isFirstRender = true;
    let resizeTimeout;

    // 預計算的參數配置
    const configs = {
    desktop: {
    radius: 900,
    angleStep: Math.PI / 6,
    scaleStep: 0.08,
    yAmplitude: 100,
    skewAngle: 10,
},
    tablet: {
    radius: 300,
    angleStep: Math.PI / 6,
    scaleStep: 0.1,
    yAmplitude: 80,
    skewAngle: 8,
},
    mobile: {
    radius: 200,
    angleStep: Math.PI / 8,
    scaleStep: 0.08,
    yAmplitude: 60,
    skewAngle: 6,
},
};

    // 獲取當前配置
    function getConfig() {
    const windowWidth = window.innerWidth;
    if (windowWidth > 900) return configs.desktop;
    if (windowWidth > 600) return configs.tablet;
    return configs.mobile;
}

    // 優化的輪播更新函數
    function updateCarousel() {
    const config = getConfig();
    const { radius, angleStep, scaleStep, yAmplitude, skewAngle } = config;

    imgs.forEach((img, i) => {
    const relativeIndex = (i - currentStartIndex + totalImgs) % totalImgs;

    if (relativeIndex < visibleCount) {
    const baseIndex = relativeIndex - 2;
    const angle = baseIndex * angleStep;
    const x = Math.sin(angle) * radius;
    const z = -Math.abs(Math.cos(angle) * radius);
    const y = Math.cos(angle) * yAmplitude - yAmplitude;
    const scale = 1 - Math.abs(baseIndex) * scaleStep;

    let rotateY;
    if (relativeIndex === 0) {
    rotateY = -(-1 * angleStep) * (180 / Math.PI);
} else if (relativeIndex === visibleCount - 1) {
    rotateY = -(1 * angleStep) * (180 / Math.PI);
} else {
    rotateY = -angle * (180 / Math.PI);
}

    const skewYAngle =
    baseIndex < 0 ? -skewAngle : baseIndex > 0 ? skewAngle : 0;

    const baseTransform = `translateX(${x}px) translateY(${y}px) translateZ(${-z}px) scale(${scale}) rotateY(${rotateY}deg) skewY(${skewYAngle}deg)`;

    img.dataset.baseTransform = baseTransform;
    img.style.opacity = 1;
    img.style.zIndex = 100 - Math.abs(baseIndex);
    img.style.transform = baseTransform;
} else {
    img.style.opacity = 0;
    img.style.zIndex = 0;
    img.style.transform = "translateZ(-2000px) scale(0.5)";
}
});

    // 延遲觸發彈跳動畫
    if (!isFirstRender) {
    setTimeout(
    () => {
    const centerImg = imgs[(currentStartIndex + 2) % totalImgs];
    bounceImage(centerImg);
},
    parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
    "--transition-time",
    ),
    ),
    );
}
}

    // 以下為補充：彈跳動畫、控制按鈕、縮放處理與初始化
    function bounceImage(img) {
    if (!img || !img.dataset || !img.dataset.baseTransform) return;
    const rootStyles = getComputedStyle(document.documentElement);
    const duration =
    parseInt(rootStyles.getPropertyValue("--bounce-duration")) || 400;
    const peakY = rootStyles.getPropertyValue("--bounce-peak-y") || "-40px";
    const peakScale =
    parseFloat(rootStyles.getPropertyValue("--bounce-peak-scale")) || 1.1;
    const base = img.dataset.baseTransform;
    img.animate(
    [
{ transform: `${base} translateY(0px) scale(1)` },
{ transform: `${base} translateY(${peakY}) scale(${peakScale})` },
{ transform: `${base} translateY(0px) scale(1)` },
    ],
{ duration: duration, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
}

    function showNext() {
    if (isAnimating) return;
    isAnimating = true;
    const maxStart = totalImgs / 2;
    currentStartIndex = (currentStartIndex + 1) % maxStart;
    updateCarousel();
    setTimeout(
    () => {
    isAnimating = false;
    isFirstRender = false;
},
    parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
    "--transition-time",
    ),
    ),
    );
}

    function showPrev() {
    if (isAnimating) return;
    isAnimating = true;
    const maxStart = totalImgs / 2;
    currentStartIndex = (currentStartIndex - 1 + maxStart) % maxStart;
    updateCarousel();
    setTimeout(
    () => {
    isAnimating = false;
    isFirstRender = false;
},
    parseInt(
    getComputedStyle(document.documentElement).getPropertyValue(
    "--transition-time",
    ),
    ),
    );
}

    const nextBtn = document.getElementById("nextone");
    const prevBtn = document.getElementById("lastone");
    if (nextBtn) nextBtn.addEventListener("click", showNext);
    if (prevBtn) prevBtn.addEventListener("click", showPrev);

    document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
});

    window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
    updateCarousel();
}, 120);
});

    updateCarousel();
    setTimeout(() => {
    isFirstRender = false;
}, 50);
