import ast

# NOTE!!
# This code only works with the filepath as a python file
# I.e it can only read and build an ast for a python file
filepath="test_finder.py"

def find_definition(linenum):
    """Parameter is a number of a line. 
    Returns the function name the line is in and the range where that function spans. Ex: foo (1,5),
    meaning that the function name is foo and it spans from line 1 to line 5."""
    functions = {}
    with open(filepath) as file:
        tree = ast.parse(file.read())

        for item in ast.walk(tree):
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                start, end = compute_size(item)

                functions[item.name] = (start, end)

    for key, value in functions.items():
        if value[0] <= linenum <= value[1]:
            return key, value

def compute_size(node):
    min_lineno = node.lineno
    max_lineno = node.lineno
    for node in ast.walk(node):
        if hasattr(node, "lineno"):
            min_lineno = min(min_lineno, node.lineno)
            max_lineno = max(max_lineno, node.lineno)
    return (min_lineno, max_lineno + 1)

function, func_range = find_definition(1)

print(function, func_range)

#foo (1, 3)

function, func_range = find_definition(4)

print(function, func_range)

#bar (4, 6)