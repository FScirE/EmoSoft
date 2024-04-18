import ast
import sys

# NOTE!!
# This code only works with the filepath as a python file
# I.e it can only read and build an ast for a python file

##-----------------------------------------------------------------##
# Open and read the file containing the values of which lines
try:
    # Open the file in read mode
    with open('lineDictionary.txt', 'r') as file:
        # Read the contents of the file
        content = file.read().split('\n')
except:
    raise "Error opening file. Traceback to findFuncFromLines.py"

##-----------------------------------------------------------------##

#filepath="testfile.py"
filepath = str(sys.argv[1]).replace('\\', '/')

def find_definition(line_num):
    """
    Parameter is the number of a line. 
    Returns the function name the line is in. Ex: foo, meaning that the function name is foo.
    A return value of -1 means that the line of code is not within a function.
    """
    print ("called find def")
    functions = {}
    try:
        with open(filepath) as file:
            tree = ast.parse(file.read())

            for item in ast.walk(tree):
                if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    start, end = compute_size(item)

                    functions[item.name] = (start, end)
    except:
        raise "Error with path: " + filepath

    for key, value in functions.items():
        if value[0] <= line_num <= value[1]:
            return key, value
        
    return -1

def compute_size(node):
    min_lineno = node.lineno
    max_lineno = node.lineno
    for node in ast.walk(node):
        if hasattr(node, "lineno"):
            min_lineno = min(min_lineno, node.lineno)
            max_lineno = max(max_lineno, node.lineno)
    return (min_lineno, max_lineno + 1)

##-----------------------------------------------------------------##
# Calls the function and checks which lines we looked for
# the longest amount of time
# Adds it to a list "list_funcs" which is a list of dicts
# The dict is line number as key and amount of time as value

dict_funcs = {}

for line in content:
    if (line != ''):
        key = int(line.split(":")[0])
        value = int(line.split(":")[1])
        
        print(f"this is line: ", key)
        function_name = find_definition(key)
        print(function_name)
        
        if (function_name not in dict_funcs):
            dict_funcs[function_name] = value
        else:
            dict_funcs[function_name] += value

print("hi")
print(dict_funcs)
##-----------------------------------------------------------------##

# Open the file in append mode
with open('fullDictionaryFile.txt', 'a') as dict_file:
    # Append to the end of the file
    content = dict_file.write(str(dict_funcs) + "\n")
    dict_file.close()

with open('stuckLine.txt', 'w') as stuck_file:
    try:
        content = max(dict_funcs, key=dict_funcs.get)
        if (dict_funcs[content] >= 19):
            stuck_file.write(content)
        stuck_file.close()
    except:
        stuck_file.close()
        raise "No functions in focus"

##-----------------------------------------------------------------##
# TESTS

print(find_definition(41))
# function = find_definition(50)
# print(function)
