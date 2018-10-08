/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Helper func
function distanceBetweenPositions(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
  }
  
  function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }
  
  function frame(source, x, y, width, height) {
    let texture, imageFrame;
    //If the source is a string, it's either a texture in the
    //cache or an image file
    if (typeof source === "string") {
      if (TextureCache[source]) {
        texture = new Texture(TextureCache[source]);
      }
    } //If the `source` is a texture, use it
    else if (source instanceof Texture) {
      texture = new Texture(source);
    }
    if(!texture) {
      console.log(`Please load the ${source} texture into the cache.`);
    } else {
    //Make a rectangle the size of the sub-image
      imageFrame = new Rectangle(x, y, width, height);
      texture.frame = imageFrame;
      return texture;
    }
  }
  
  function wait(duration = 0) {
    return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
    });
  }
  
  function linkFont(source) {
     //Use the font's filename as the `fontFamily` name. This code captures
     //the font file's name without the extension or file path
     let fontFamily = source.split("/").pop().split(".")[0];
     //Append an `@afont-face` style rule to the head of the HTML document
     let newStyle = document.createElement("style");
     let fontFace
     = "@font-face {font-family: '" + fontFamily
     + "'; src: url('" + source + "');}";
     newStyle.appendChild(document.createTextNode(fontFace));
     document.head.appendChild(newStyle);
  }
  
  function contain(sprite, container) {
    //Create a `Set` called `collision` to keep track of the
    //boundaries with which the sprite is colliding
    var collision = new Set();
    //Left
    //If the sprite's x position is less than the container's x position,
    //move it back inside the container and add "left" to the collision Set
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision.add("left");
    }
    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision.add("top");
    }
    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision.add("right");
      }
    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision.add("bottom");
    }
    //If there were no collisions, set `collision` to `undefined`
    if (collision.size === 0) collision = undefined;
    //Return the `collision` value
    return collision;
  }
  
  function scaleToWindow(canvas, backgroundColor) {
    var scaleX, scaleY, scale, center;
  
    //1. Scale the canvas to the correct size
    //Figure out the scale amount on each axis
    scaleX = window.innerWidth / canvas.offsetWidth;
    scaleY = window.innerHeight / canvas.offsetHeight;
  
    //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
    scale = Math.min(scaleX, scaleY);
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform = "scale(" + scale + ")";
  
    //2. Center the canvas.
    //Decide whether to center the canvas vertically or horizontally.
    //Wide canvases should be centered vertically, and
    //square or tall canvases should be centered horizontally
    if (canvas.offsetWidth > canvas.offsetHeight) {
      if (canvas.offsetWidth * scale < window.innerWidth) {
        center = "horizontally";
      } else {
        center = "vertically";
      }
    } else {
      if (canvas.offsetHeight * scale < window.innerHeight) {
        center = "vertically";
      } else {
        center = "horizontally";
      }
    }
  
    //Center horizontally (for square or tall canvases)
    var margin;
    if (center === "horizontally") {
      margin = (window.innerWidth - canvas.offsetWidth * scale) / 2;
      canvas.style.marginTop = 0 + "px";
      canvas.style.marginBottom = 0 + "px";
      canvas.style.marginLeft = margin + "px";
      canvas.style.marginRight = margin + "px";
    }
  
    //Center vertically (for wide canvases)
    if (center === "vertically") {
      margin = (window.innerHeight - canvas.offsetHeight * scale) / 2;
      canvas.style.marginTop = margin + "px";
      canvas.style.marginBottom = margin + "px";
      canvas.style.marginLeft = 0 + "px";
      canvas.style.marginRight = 0 + "px";
    }
  
    //3. Remove any padding from the canvas  and body and set the canvas
    //display style to "block"
    canvas.style.paddingLeft = 0 + "px";
    canvas.style.paddingRight = 0 + "px";
    canvas.style.paddingTop = 0 + "px";
    canvas.style.paddingBottom = 0 + "px";
    canvas.style.display = "block";
  
    //4. Set the color of the HTML body background
    document.body.style.backgroundColor = backgroundColor;
  
    //Fix some quirkiness in scaling for Safari
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("safari") != -1) {
      if (ua.indexOf("chrome") > -1) {
        // Chrome
      } else {
        // Safari
        //canvas.style.maxHeight = "100%";
        //canvas.style.minHeight = "100%";
      }
    }
  
    //5. Return the `scale` value. This is important, because you'll nee this value
    //for correct hit testing between the pointer and sprites
    return scale;
  }
  