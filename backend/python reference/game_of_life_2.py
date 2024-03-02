import pygame
import numpy as np

# Initialize Pygame
pygame.init()


randstr ="0001010101100110011010110000101011000101111001010101110001000010000001100000001010110000010011101100110000101111010101101101011100101100000110001100100001111011010010111111010110011110010100100100110000011011110100011010100001111111101111101011000100011011"

# Set dimensions of the grid
grid_width = 16
grid_height = 16
cell_size = 10
grid = np.zeros((grid_width, grid_height), dtype=int)

# Set colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLUE = (0, 0, 255)

# Set up the display
screen = pygame.display.set_mode((grid_width * cell_size, grid_height * cell_size))
pygame.display.set_caption("Conway's Game of Life - Two Players")

# Function to draw the grid
def draw_grid():
    screen.fill(WHITE)
    for x in range(grid_width):
        for y in range(grid_height):
            if grid[x, y] == 1:
                color = RED
            elif grid[x, y] == 2:
                color = BLUE
            else:
                color = BLACK
            pygame.draw.rect(screen, color, (x * cell_size, y * cell_size, cell_size, cell_size), 0)
    pygame.display.flip()

# Function to update the grid based on Conway's rules
    
# def calculate_neighbors(x, y):
#     neighbors = 0
#     for i in range(-1, 2):
#         for j in range(-1, 2):
#             if i == 0 and j == 0:
#                 continue
#             if x + i < 0 or x + i >= grid_width or y + j < 0 or y + j >= grid_height:
#                 continue
#             if grid[x + i, y + j] != 0:
#                 neighbors += 1
#     return neighbors -


def update_grid():
    new_grid = np.zeros_like(grid)
    for x in range(grid_width):
        for y in range(grid_height):
            neighbors = np.sum(grid[max(0, x-1):min(grid_width, x+2), max(0, y-1):min(grid_height, y+2)]) - grid[x, y]
            #neighbors = calculate_neighbors(x, y)
            #print(neighbors)
            if grid[x, y] == 1:
                if neighbors < 2 or neighbors > 3:
                    new_grid[x, y] = 0
                else:
                    new_grid[x, y] = 1
            elif grid[x, y] == 2:
                if neighbors < 2 or neighbors > 3:
                    new_grid[x, y] = 0
                else:
                    new_grid[x, y] = 2
            else:
                if neighbors == 3:
                    new_grid[x, y] = 1 if int(randstr[16*x+y]) == 0 else 2

    #print(grid) 
    return new_grid


running = True
player_turn = 1

def real_print(array):
    print('[', end='')
    for i, row in enumerate(array):
        print('[', end='')
        for j, element in enumerate(row):
            print(element, end=', ' if j < len(row) - 1 else '')
        print(']', end='' if i == len(array) - 1 else ', ')
    print(']')

while running:
            
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            x, y = event.pos
            grid_x, grid_y = x // cell_size, y // cell_size
            if grid[grid_x, grid_y] == 0:
                grid[grid_x, grid_y] = player_turn
                player_turn = 1 if player_turn == 2 else 2
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
            real_print(grid)
            grid = update_grid()

    draw_grid()

# Quit Pygame
pygame.quit()