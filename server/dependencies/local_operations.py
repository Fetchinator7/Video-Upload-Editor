import pathlib as paths
import datetime as dates
import subprocess as sub
import sys
sys.path.append(str(paths.Path.joinpath(paths.Path(__file__).parent, 'FFmpeg-Commands')))
sys.path.append(str(paths.Path.joinpath(paths.Path(__file__).parent, 'System-Commands')))
import ffmpeg_cmds as fc
import system as syst

print('running vimeo file')

# The path to the main output directory (computer specific.)
path_to_main_out_save_folder = paths.Path(sys.argv[1])
if path_to_main_out_save_folder.exists() is False:
	print(f'Error, output folder "{path_to_main_out_save_folder}" not found.')
	raise FileNotFoundError

def main(main_out_save_dir):
	"""Main function to easily see what is being done at a glance."""

	# usr_name, title_with_date, vid_path, = decode_clipboard_info()
	ren_method_used = 'Davinci Resolve'
	org_in_vid_path = paths.Path(sys.argv[2])
	title = sys.argv[3]
	usr_name = sys.argv[4]
	title_with_date = dates.datetime.now().strftime("%m-%d-%Y ") + title

	# Rename the input file to title_with_date.
	renamed_in_path = org_in_vid_path.with_name(title_with_date).with_suffix(org_in_vid_path.suffix)
	org_in_vid_path.rename(renamed_in_path)

	# Create a folder for the current month (it may already exist) and create a folder named by video title.
	cur_month_dur = syst.Paths().create_cur_year_month_dir(path_to_main_out_save_folder)
	out_dir_path = syst.Paths().create_dir(cur_month_dur, title)
	
	if out_dir_path is False:
		# The output folder already exists so quit.
		print(f'Error, the output folder "{title}" already exists.')
		raise FileExistsError
	else:
		# fc.FileOperations(renamed_in_path, out_dir_path).reverse()

		# The output folder was successfully created so continue.
		# Run function to write session info to a text file.
		fin_log(usr_name, title_with_date, ren_method_used, renamed_in_path, out_dir_path)

		# For the sake of convenience, open Davinci Resolve and the input video folder.
		# syst.Operations().open_path_or_app('Davinci Resolve')
		syst.Operations().open_path_or_app(renamed_in_path.parent)

def decode_clipboard_info():
	"""This function reads the contents of the clipboard and assigns some of those values to variables."""
	pass

def fin_log(usr, title, ren_method_used, renamed_in_path, out_dir_path):
	"""Create log file."""

	# Path to log file and create it.
	session_txt_path = paths.Path().joinpath(out_dir_path, title + '-log').with_suffix('.txt')
	paths.Path.touch(session_txt_path)

	current_time = dates.datetime.now().strftime("%I:%M%p on %m/%d/%Y")
	# Write info about session to .txt file in the save location.
	session_info = ['User: ' + usr, 'Title: ' + title, 'Started editing at '+ current_time,
					'Render method used: ' + ren_method_used, 'Renamed source file: '
					+ str(renamed_in_path), 'Output directory: ' + str(out_dir_path)]
	session_write = '\n'.join(session_info)
	session_txt_path.write_text(session_write)
	print(f'Session log created at "{session_txt_path}"')


main(path_to_main_out_save_folder)
