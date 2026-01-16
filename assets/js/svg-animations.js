// ANIMACIONES SVG

const tlSvg = gsap.timeline({ 
    repeat: -1, 
});

// Humo

tlSvg.fromTo("#humo", 
    { drawSVG: "100% 100%" }, 
    { duration: 1.5, drawSVG: "100% 0%", ease: "power1.inOut" }
  )
  .to("#humo", 
    { duration: 1.5, drawSVG: "0% 0%", ease: "power1.inOut" }
  );

// Parpadeo

// Esto al parecer convierte todos los círculos y elipses a paths para que GSAP pueda manipular sus puntos...
MorphSVGPlugin.convertToPath("circle, ellipse");

gsap.set(["#cerrado1", "#cerrado2"], { visibility: "hidden" });

const tlBlink = gsap.timeline({
    repeat: -1, 
    repeatDelay: 5 
});

tlBlink.to("#ojo1", {
    morphSVG: "#cerrado1",
    duration: 0.1,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 3
}, 0);

tlBlink.to("#ojo2", {
    morphSVG: "#cerrado2",
    duration: 0.1,
    ease: "power2.inOut",
    yoyo: true,
    repeat: 3
}, 0);
