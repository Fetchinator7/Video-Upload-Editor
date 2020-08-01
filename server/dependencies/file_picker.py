from tkinter.filedialog import askopenfilename
from tkinter import Tk
import platform

root = Tk()
if platform.system() != 'Darwin':
    root.lift()
    root.attributes("-topmost", True)
else:
    import os
    os.system('''/usr/bin/osascript -e 'tell app "Finder" to set frontmost of process "Python" to true' ''')

root.withdraw()
# We don't want a full GUI, so keep the root window from appearing
# show an "Open" dialog box and return the path to the selected file
filename = askopenfilename(filetypes=[("Video files", ".mp4 .mov")])
print(filename)
