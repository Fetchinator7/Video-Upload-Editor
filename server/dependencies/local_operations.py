import pathlib as paths
import datetime as dates
import subprocess as sub
import shutil
import sys
# Append these submodules to the system path so they can be imported.
sys.path.append(str(paths.Path.joinpath(paths.Path(__file__).parent, 'FFmpeg-Commands')))
sys.path.append(str(paths.Path.joinpath(paths.Path(__file__).parent, 'System-Commands')))
import ffmpeg_cmds as fc
import system as syst

# The path to the main output directory. This is where folders for the current
# month and year will be generated.
path_to_main_out_save_folder = paths.Path(sys.argv[1])
if path_to_main_out_save_folder.exists() is False:
	raise FileNotFoundError(f'Error, output folder "{path_to_main_out_save_folder}" not found.')


def main(main_out_save_dir):
	# These arguments come in from from the command line that called this process.
	org_in_vid_path = paths.Path(sys.argv[2])
	title = sys.argv[3]
	usr_name = sys.argv[4]
	export_audio = sys.argv[5]

	# Rename the input file to be the input title.
	renamed_in_path = org_in_vid_path.with_name(title).with_suffix(org_in_vid_path.suffix)
	org_in_vid_path.rename(renamed_in_path)

	# Create a folder for the current year and month (they may already exist)
	# and create a folder with the name of the video title.
	cur_month_dur = syst.Paths().create_cur_year_month_dir(path_to_main_out_save_folder)
	out_dir_path = syst.Paths().create_dir(cur_month_dur, title)

	if out_dir_path is False:
		# The output folder already exists so return an error.
		raise FileExistsError(f'Error, the output folder "{title}" already exists.')
	else:
		print('Encoding...\n')
		# Record the rendering start time for the log.
		start_render = dates.datetime.now().strftime("%I:%M:%S%p on %m/%d/%Y")

		# Run the ffmpeg command to normalize the input video audio and compress it.
		# fc.FileOperations(renamed_in_path, norm_aud_dir).compress_using_h265_and_norm_aud()
		# fc.FileOperations(renamed_in_path, out_dir_path).trim('5', '15')
		fc.FileOperations(renamed_in_path, out_dir_path).loudnorm_stereo()

		# Get the path of the output file.
		out_path = paths.Path.joinpath(out_dir_path, title + '.mp4')
		# If the user said to export audio as well then copy the output to a .mp3 file.
		if export_audio == 'true':
			fc.FileOperations(out_path, out_dir_path).change_ext('.mp3')

		# Record the rendering end time for the log.
		end_render = dates.datetime.now().strftime("%I:%M:%S%p on %m/%d/%Y" )
		# Run function that makes a text file with some relevant information.
		fin_log(usr_name, title, renamed_in_path, start_render, end_render, out_path, out_dir_path)
		print("{" + str(out_path) + "}")


def fin_log(usr, title, renamed_in_path, start, end, out_vid, out_dir_path):
	"""Create log file."""

	# Path to log file and create it.
	session_txt_path = paths.Path().joinpath(out_dir_path, title + '-log').with_suffix('.txt')
	paths.Path.touch(session_txt_path)

	# Write info about session to .txt file in the save location.
	session_info = [f'User: {usr}', f'Title: {title}', f'Started rendering at {start}',
					f'Finished rendering at {end}', f'Output video: {str(out_vid)}',
					f'Renamed source file: {str(renamed_in_path)}']
	session_write = '\n'.join(session_info)
	session_txt_path.write_text(session_write)


main(path_to_main_out_save_folder)
