1. Create Canvas (Grey Background, autosizes to the browser)

2. Create 3 red buttons which flash blue when clicked/triggered:
• Clear – Removes all vertices and edges
• Close – draws edges between vertices
• Step-Up – steps up the drawing from 2D to 3D to 4D projection (loops back to 2D)

3. Click event handler 
• If cursor is over a button, don’t draw a vertex on user click gesture
• Else, if cursor is over the canvas and the user clicks, draw a vertex there (vertices should be little white dots)
‣ Vertices should be stored in a data structure. This data structure contains the index (first vertex drawn, second vertex drawn, etc…), and the coordinates in 2D space of that vertex (a tuple, containing X/Y coordinates)

4.Buttons logic
• If the user clicks the Clear button, clear all vertex data in the data structure, and refresh the display to reflect this deletion. The Clear button can be clicked at any time.
• If the user clicks the Close button, draw an edge between all the vertices that have been drawn in 2D. This button can only be clicked after there have been at least 2 vertices drawn. If the user has clicked the Step-Up button, and it was a valid signal, the Close button should be disabled until the Clear button is clicked. The edges should be drawn as thin, transparent, fluorescent green lines.
• If the user clicks the Step-Up button, and the data structure reflects in 2D space at least 2 points that have been closed (that is to say, had their edges drawn), then the following process occurs:
‣ Determine Z-amount: Run a recursive function which takes the average of all results of this loop: For each vertex “j”, calculate the distance between j and the previous/next vertices contained in the data structure.
‣ With that Z-amount having been determined, copy the 2D graphic and offset it by that z-amount away from the camera. Close the edges between each vertex in the clone and its corresponding vertex in the original. This way, if the user has drawn a 2D square, The Step-Up button renders a 3D cube. 
‣ By the same logic, extrapolate a 3D projection slice of a 4D Hypercube when the user Steps-Up a 3D scene. If they 
click Step-Up on a 4D projection render, return to displaying the 2D scene graphic… this should loop.
‣ In 3D and 4D Projection renders, slowly rotate the graphic clockwise perpendicular to the screen, so as to accentuate the visual depth.
