document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    dir = new Victor();
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */ 
            dir.x = -1;
            dir.y = 0;

        } else {
            /* right swipe */
            dir.x = 1;
            dir.y = 0;
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */ 
            dir.x = 0;
			dir.y = -1;
        } else { 
            /* down swipe */
            dir.x = 0;
            dir.y = 1;
        }                                                                 
    }
    socket.emit("changeDir", {"dir":dir, "id":joinedGameId, "playerNumber": myPlayerNumber });		//send swipe to server
    /* reset values */
    xDown = null;
    yDown = null;                                             
};