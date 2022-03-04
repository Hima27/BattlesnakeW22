




def get_body_directions(body):
    
    directions = []
    
    #is head, we do not know
    directions[0] = -1
    
    for i in range(1,len(body)):
        
        current_body_part = body[i]
        
        #i decrements as we get closer to head
        previous_body_part = body[i-1]
        
        #left
        if previous_body_part["x"] < current_body_part["x"]:
            directions[i] = 2
        #right
        elif previous_body_part["x"] > current_body_part["x"]:
            directions[i] = 3
        #down
        elif previous_body_part["y"] < current_body_part["y"]:
            directions[i] = 1
        #up
        elif previous_body_part["y"] > current_body_part["y"]:
            directions[i] = 0
        
        
    return directions
        