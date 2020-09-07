from tkinter.filedialog import askopenfilename
from tkinter import Tk

# Make the root gui element.
root = Tk()
# Bring the window to the front.
root.lift()
root.attributes("-topmost", True)

# We don't want a full GUI so keep the root window from appearing.
root.withdraw()
# Show an "Open" dialog box and return the path to the selected file.
filename = askopenfilename(filetypes=[("Video files", ".mp4 .mov .mkv")])
# Print the file path which will be read by the server.
print(filename)
