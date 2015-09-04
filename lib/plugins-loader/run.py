import sys
import json
import os
import imp

filePath = sys.argv[1]
pluginPath = os.path.dirname(filePath)
os.chdir(pluginPath)

command = sys.argv[2]
plugin = imp.load_source('plugin', filePath, )
if command == 'results':
	query = json.loads(sys.argv[3])
	print json.dumps(plugin.results(query, 'not available'))

elif command == 'run':
	query = json.loads(sys.argv[3])
	print json.dumps(plugin.run(query))

else:
	print json.dumps({error: 'Command '+command+' does not exist.'})
