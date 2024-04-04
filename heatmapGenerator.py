#import numpy as np
import matplotlib.pyplot as plt
import math
import random
import sys

GRID_WIDTH = 48
GRID_HEIGHT = 27

def read_file(path):
    """reads file contents"""
    file = open(path, 'r')
    text = file.read()
    file.close()
    if text == '':
        return '0'
    return text

#get cwd from all arguments, fixed to work with space in folder names
this_cwd = ''
for arg in sys.argv[1:]:
    this_cwd += arg + ' '
this_cwd = this_cwd.rstrip()

#this_cwd = 'c:\\Users\\maxco\\OneDrive\\Dokument\\GitHub\\EmoSoft'

x_arr = list(map(float, read_file(this_cwd + '\\xValues.txt').split(','))) 
y_arr = list(map(float, read_file(this_cwd + '\\yValues.txt').split(',')))
#x_arr = [random.random() for _ in range(10000)] # test
#y_arr = [random.random() for _ in range(10000)] # test
# 1 ruta är 1/48 bred och 1/27 hög

def calculate_intensity(x_in, y_in):
    """Calculates the intensity for the heatmeap, based on x and y."""
    intensity = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
    for i in range(0, len(x_in)):
        intensity[math.floor(y_in[i]*GRID_HEIGHT)][math.floor(x_in[i]*GRID_WIDTH)] += 1

    return intensity
                               
def generate_heatmap(x_in, y_in):
    """Generates a heatmap, stores it as heatmap.jpg"""
    intensity = calculate_intensity(x_in, y_in)

    # Sample X and Y data
    #X, Y = np.meshgrid(GRID_WIDTH, GRID_HEIGHT)

    # Create heatmap
    plt.imshow(intensity, cmap='hot', interpolation='nearest')
    plt.colorbar()  # Add color bar indicating the scale
    #plt.show()
    plt.savefig("heatmap.png", transparent=True)

generate_heatmap(x_arr, y_arr)
exit(0)
