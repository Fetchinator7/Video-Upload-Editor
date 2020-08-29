import pathlib as paths
import datetime as dates
import tempfile
import sys
# Append these submodules to the system path so they can be imported.
sys.path.append(str(paths.Path.joinpath(paths.Path(__file__).parent, 'FFmpeg-Commands')))
sys.path.append(str(paths.Path.joinpath(paths.Path(__file__).parent, 'System-Commands')))
import ffmpeg_cmds as fc
import system as syst

# The path to the main output directory.
# This is where folders for the current month and year will be generated.
path_to_main_out_save_folder = paths.Path(sys.argv[1])
if path_to_main_out_save_folder.exists() is False:
	raise FileNotFoundError(f'Error, output folder "{path_to_main_out_save_folder}" not found.')


def main(main_out_save_dir):
	# These arguments come in from from the command line that called this process.
	org_in_vid_path = paths.Path(sys.argv[2])
	title = sys.argv[3]
	usr_name = sys.argv[4]
	export_audio = sys.argv[5]
	compress = sys.argv[6]
	start_time = sys.argv[7]
	end_time = sys.argv[8]
	codec_copy = sys.argv[9]
	add_pixel_format = sys.argv[10]

	output_video_extension = '.mp4'

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

		# Record the render start time for the log.
		start_render = dates.datetime.now().strftime("%I:%M:%S%p on %m/%d/%Y")

		def render(input_file):
			if compress == 'true':
				# Compressionion enabled so use a different ffmpeg command
				# to compress the input video.
				fc.FileOperations(input_file, out_dir_path).compress_using_h265_and_norm_aud(new_ext=output_video_extension, insert_pixel_format=add_pixel_format)
			else:
				# Run the ffmpeg command to normalize the input video audio.
				# This is done by scanning the input to see how many decibels it can
				# be raised by before clipping occurs, then raising it by that amount.
				fc.FileOperations(input_file, out_dir_path).loudnorm_stereo()

		if start_time != "" or end_time != "":
			# Make a temporary folder where the output of the audio normalization wil be sent
			# (The output can't be in the same directory as the input so make this temp folder)
			trim_dir = tempfile.TemporaryDirectory()
			trim_dir_path = paths.Path(trim_dir.name)
			fc.FileOperations(renamed_in_path, trim_dir_path).trim(start_time, end_time, codec_copy=bool(codec_copy))
			out_trim_path = paths.Path.joinpath(trim_dir_path, renamed_in_path.name)
			render(out_trim_path)
		else:
			render(renamed_in_path)

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
