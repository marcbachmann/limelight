def centered_text(html, hint_text=""):
	base = u"""
		<style>
		html, body {
			margin: 0px;
			width: 100%;
			height: 100%;
			color: black;
			font-family: "HelveticaNeue";
		}
		body > #centered {
			display: table;
			width: 100%;
			height: 100%
		}
		body > #centered > div {
			display: table-cell;
			vertical-align: middle;
			text-align: center;
			font-size: x-large;
			line-height: 1.1;
			padding: 30px;
		}
		#hint {
			opacity: 0.5;
			font-weight: bold;
			font-size: small;
			position: absolute;
			left: 10px;
			right: 10px;
			bottom: 10px;
			text-align: center;
		}
		</style>
		<body>
		<div id='centered'>
		<div>
			{{ html }}
		</div>
		</div>
		<div id='hint'>
		{{ hint }}
		</div>
		</body>
	"""
	return base.replace("{{ html }}", html).replace("{{ hint }}", hint_text)
