#!/usr/bin/python3
"""
Auto-generates JavaScript imports, considering
dependencies between files.
"""

import dcore.env_setup as env_setup

import glob
import os

def getScriptsFilenames():
    files = list(glob.iglob('.' + '/**/*.**', recursive=True))
    files = [f for f in files if f[-3:] == '.js']
    return set(files)

def extractNew(data: str):
    """
    Data -> just full type (e.g: new MyClass() -> MyClass).
    """
    assert type(data) == str

    news = set()
    
    for i, c in enumerate(data):
        if data[i:i+len('extends')] == 'extends':
            rest = []
            for j in range(i, len(data)):
                if data[j] == '\n': break
                if data[j] == '{': break
                rest.append(data[j])
            rest = "".join(rest)
            news.add(rest[len('extends'):].strip())

        if data[i:i+len('new')] == 'new':
            rest = []
            for j in range(i, len(data)):
                if data[j] == '\n': break
                rest.append(data[j])
                if data[j] == '(': break
            rest = "".join(rest)
            if rest[-1:] == '(':
                news.add(rest[len('new'):-1].strip())

    return news

def genDepends(files: set):
    """
    filename -> set of filename(s) it depends on.

    {file.js: set(depend1.js, depend2,js, ...)}
    """

    assert type(files) == set
    depends = {}

    for f in files:
        data = open(f, 'r').read()
        dependencies = extractNew(data)

        fBase = os.path.basename(f)
        if fBase not in depends:
            depends[fBase] = set()
        for dep in dependencies:
            print(dep)
            depends[fBase].add(dep + '.js')

    return depends

def toposort(graph):
    """
    Graph -> list of vertices in topological order.
    """

    for e in graph.items():
        print(e)

    def dfs(vertex, graph, seen, processed):
        if vertex in processed: return []
        processed.add(vertex)

        print('Vertex: ' + vertex)
        if vertex in seen:
            print('Circular: ' + vertex)
            assert vertex not in seen
        seen.add(vertex)

        if vertex in graph:
            children = graph[vertex]
            recChildren = []
            for c in children:
                if c != vertex:
                    recChildren += dfs(c, graph, seen, processed)
            seen.remove(vertex)
            return recChildren + [vertex]
        else:
            seen.remove(vertex)
            return [vertex]

    accumulator = []
    vertices = set(list(graph))
    processed = set()
    while len(vertices) > 0:
        vertex = vertices.pop()
        seen = set()
        print('New root: ' + vertex)
        accumulator += dfs(vertex, graph, seen, processed)

    return accumulator

def gen(fileOrder):
    tagBegin = '<!-- BEGIN: auto-js -->'
    tagEnd = '<!-- END: auto-js -->'
    template = '<script src="__file__"></script>'

    files = sorted([f[2:] for f in getScriptsFilenames()])

    fMap = {}
    for f in files:
        fMap[os.path.basename(f)] = f

    files = [fMap[f] for f in fileOrder if f in fMap]
    insert = [template.replace('__file__', f) for f in files]
    insert = "\n".join(insert)

    env_setup.updateFileContentBetweenMarks('./index.html', tagBegin, tagEnd, insert, False)


if __name__ == '__main__':
    scripts = getScriptsFilenames()
    depends = genDepends(scripts)
    topoDepends = toposort(depends)
    gen(topoDepends)

