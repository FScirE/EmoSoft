#import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as clr
import math
import sys

# Heatmap grid contstants
GRID_WIDTH = 48
GRID_HEIGHT = 27

def read_file(path):
    """Reads file contents. Returns the contents."""
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

x_arr = list(map(float, read_file(this_cwd + '\\xValues.txt').split(',')))
y_arr = list(map(float, read_file(this_cwd + '\\yValues.txt').split(',')))
# import random
# x_arr = [random.random() for _ in range(10000)] # test
# y_arr = [random.random() for _ in range(10000)] # test


def calculate_intensity(x_in, y_in):
    """Calculates the intensity for the heatmeap, based on x and y."""
    intensity = [[0 for x in range(GRID_WIDTH)] for y in range(GRID_HEIGHT)]
    for i in range(0, len(x_in)):
        intensity[math.floor(y_in[i]*GRID_HEIGHT)][math.floor(x_in[i]*GRID_WIDTH)] += 1

    return intensity

def generate_heatmap(x_in, y_in):
    """Generates a heatmap, stores it as heatmap.jpg. x_in and y_in are arrays containing the x and y values. """
    intensity = calculate_intensity(x_in, y_in)

    # Sample X and Y data
    #X, Y = np.meshgrid(GRID_WIDTH, GRID_HEIGHT)

    #Create heatmap
    img = plt.imread("vscodewin.png")
    plt.imshow(img, extent=[0, GRID_WIDTH, GRID_HEIGHT, 0])

    max_val = max([max(e) for e in intensity]) #get highest value of all points

    norm = clr.Normalize(vmin=0, vmax=max_val)

    cmap = clr.LinearSegmentedColormap.from_list(name='transparent-red', colors=[(0, 0, 0, 0), (0.33, 0, 0, 0.33), (0.67, 0, 0, 0.67), (1, 0, 0, 1), (1, 1, 1, 1)])
    plt.imshow(intensity, cmap=cmap, norm=norm, interpolation='catrom', extent=[0, GRID_WIDTH, GRID_HEIGHT, 0])

    cbar = plt.colorbar()  # Add color bar indicating the scale
    cbar.set_ticks([0, max_val])
    cbar.set_ticklabels(['Min', 'Max'])

    # Remove x- and y-labels on the heatmap
    plt.gca().set_yticks([])
    plt.gca().set_yticklabels([])
    plt.gca().set_xticks([])
    plt.gca().set_xticklabels([])

    # heatmap border set to white
    plt.gca().spines['top'].set_color('white')
    plt.gca().spines['bottom'].set_color('white')
    plt.gca().spines['left'].set_color('white')
    plt.gca().spines['right'].set_color('white')

    # colorbar border and labels set to white
    cbar.ax.yaxis.set_tick_params(color='white')
    plt.setp(plt.getp(cbar.ax.axes, 'yticklabels'), color='white')
    cbar.outline.set_edgecolor('white')

    #plt.show()
    plt.savefig("heatmaps/heatmap.png", transparent=True)

generate_heatmap(x_arr, y_arr)
#generate_heatmap(x_arr, y_arr)
exit(0)
