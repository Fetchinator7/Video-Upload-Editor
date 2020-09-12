import pathlib as paths
import datetime as dates
import tempfile
import sys
# Append these submodules to the system path so they can be imported.
sys.path.append(str(paths.Path().joinpath(paths.Path(__file__).parent, 'FFmpeg-Commands')))
sys.path.append(str(paths.Path().joinpath(paths.Path(__file__).parent, 'System-Commands')))
import ffmpeg_cmds as fc
import system as syst


# The path to the main output directory.
# This is where folders for the current month and year will be generated.
path_to_main_out_save_folder = paths.Path(sys.argv[1])
if path_to_main_out_save_folder.exists() is False:
	raise FileNotFoundError(f'Error, output folder "{path_to_main_out_save_folder}" not found.')


def main(main_out_save_dir):
	def set_bool(argv):
		if argv == 'false':
			return False
		elif argv == 'true':
			return True
		else:
			raise NameError(f'''Error, the input args can only be "true" or "false", not '{argv}'.''')
	# These arguments come in from from the command line that called this process.
	org_in_vid_path = paths.Path(sys.argv[2])
	title = sys.argv[3]
	usr_name = sys.argv[4]
	export_audio = set_bool(sys.argv[5])
	compress = set_bool(sys.argv[6])
	start_time = sys.argv[7]
	end_time = sys.argv[8]
	codec_copy = set_bool(sys.argv[9])
	add_pixel_format = set_bool(sys.argv[10])
	compression_speed_preset = sys.argv[11]
	output_extension = sys.argv[12]
	rename_input_file = set_bool(sys.argv[13])
	invalid_characters_str = sys.argv[14]
	replace_invalid_filename_characters_with_this = sys.argv[15]

	# If export_audio is true this will be the extension used for that.
	out_aud_ext = '.mp3'

	sanitized_title = title
	for character in invalid_characters_str:
		if character in title:
			sanitized_title = sanitized_title.replace(character, replace_invalid_filename_characters_with_this)

	# Rename the input file to be the input title.
	if rename_input_file is True:
		input_video_path = org_in_vid_path.with_name(sanitized_title).with_suffix(org_in_vid_path.suffix)
		org_in_vid_path.rename(input_video_path)
	else:
		input_video_path = org_in_vid_path

	# Create a folder for the current year and month (they may already exist)
	# and create a folder with the name of the video title.
	cur_month_dur = syst.Paths().create_cur_year_month_dir(path_to_main_out_save_folder)
	out_dir_path = syst.Paths().create_dir(cur_month_dur, sanitized_title)

	if out_dir_path is False:
		# The output folder already exists so return an error.
		raise FileExistsError(f'Error, the output folder "{sanitized_title}" already exists.')
	else:
		print('Encoding...\n')

		# Record the render start time for the log.
		start_render = dates.datetime.now().strftime("%I:%M:%S%p on %m/%d/%Y")

		# If debug mode is True then the different directory generated for compressing/normalizing,
		# trimming and chanign the extension will remain alongside the output instead of being hidden
		# temporary directories. This way it's easier to tell which step of the process is failing.
		# NOTE: This isn't changed anywhere, this is just here so it's easy for a programmer to debug.
		in_debug_mode = False

		if in_debug_mode is True:
			# Make a visible output directory along side the output directory for debugging.
			loudnorm_dir_path = paths.Path().joinpath(out_dir_path.with_name(sanitized_title + '-loudnorm'))
			loudnorm_dir_path.mkdir()
		else:
			# Make a temp output directory because with the way ffmpeg_cmds is setup
			# you can't output to the same directory.
			loudnorm_dir = tempfile.TemporaryDirectory()
			loudnorm_dir_path = paths.Path(loudnorm_dir.name)
		if compress == True:
			# Compressionion is enabled so use a different ffmpeg command
			# to compress the input video.
			fc.FileOperations(input_video_path, loudnorm_dir_path).compress_using_h265_and_norm_aud(insert_pixel_format=add_pixel_format, speed_preset=compression_speed_preset, maintain_metadata=False)
		else:
			# Run the ffmpeg command to normalize the input video audio.
			# This is done by scanning the input to see how many decibels it can
			# be raised by before clipping occurs, then raising it by that amount.
			fc.FileOperations(input_video_path, loudnorm_dir_path).loudnorm_stereo()
		loudnorm_output_path = paths.Path().joinpath(loudnorm_dir_path, input_video_path.name)
		# The input file wasn't renamed so rename the output of this first video render.
		if org_in_vid_path.stem != sanitized_title:
			loudnorm_potentially_renamed_output_file = loudnorm_output_path.with_name(sanitized_title).with_suffix(org_in_vid_path.suffix)
			loudnorm_output_path.rename(loudnorm_potentially_renamed_output_file)
		else:
			# The input file was already renamed so just assign this to the output path.
			loudnorm_potentially_renamed_output_file = loudnorm_output_path

		# * The trim is after the compression because the trim doesn't always work for the uncompressed input video codec.
		if in_debug_mode is True:
			# Make a visible output directory along side the output directory for debugging.
			trim_dir_path = paths.Path().joinpath(out_dir_path.with_name(sanitized_title + '-trim'))
			trim_dir_path.mkdir()
		else:
			# Make a temp output directory because with the way ffmpeg_cmds is setup
			# you can't output to the same directory.
			trim_dir = tempfile.TemporaryDirectory()
			trim_dir_path = paths.Path(trim_dir.name)

		if start_time != "" or end_time != "":
			fc.FileOperations(loudnorm_potentially_renamed_output_file, trim_dir_path).trim(start_time, end_time, codec_copy=codec_copy)
		else:
			syst.Paths().move_to_new_dir(loudnorm_potentially_renamed_output_file, trim_dir_path)
		out_trim_path = paths.Path().joinpath(trim_dir_path, loudnorm_potentially_renamed_output_file.name)

		# The input video extension doesn't match the desired output extension.
		if out_trim_path.suffix != output_extension:
			if compress is True:
				# If the video was compressed then it's encoded so the codec can be copied.
				fc.FileOperations(out_trim_path, out_dir_path).change_ext(output_extension, codec_copy=True)
			else:
				# If the input video wasn't compressed then we don't know what
				# the input codec is so play it safe and don't copy the codec.
				fc.FileOperations(out_trim_path, out_dir_path).change_ext(output_extension, codec_copy=False)
		else:
			syst.Paths().move_to_new_dir(out_trim_path, out_dir_path)

		# Get the path of the output file.
		out_path = paths.Path().joinpath(out_dir_path, sanitized_title + output_extension)
		# If the user said to export audio as well then copy the output to a .mp3 file.
		if export_audio == True:
			fc.FileOperations(out_path, out_dir_path).change_ext(out_aud_ext)

		# Record the rendering end time for the log.
		end_render = dates.datetime.now().strftime("%I:%M:%S%p on %m/%d/%Y" )
		# Run function that makes a text file with some relevant information.
		fin_log(usr_name, title, sanitized_title, input_video_path, rename_input_file, start_render, end_render, out_path, out_dir_path)
		print("{" + str(out_path) + "}")


def fin_log(usr, title, sanitized_title, in_path, in_path_was_renamed, start, end, out_vid, out_dir_path):
	"""Create log file."""

	# Path to log file and create it.
	session_txt_path = paths.Path().joinpath(out_dir_path, sanitized_title + '-log').with_suffix('.txt')
	paths.Path.touch(session_txt_path)

	# Write info about session to .txt file in the save location.
	session_info = [f'User: {usr}', f'Title: {title}', f'Started rendering at {start}',
					f'Finished rendering at {end}', f'Output video: {str(out_vid)}']
	if in_path_was_renamed is True:
		session_info.append(f'Renamed source file: {str(in_path)}')
	else:
		session_info.append(f'Source file: {str(in_path)}')
	session_write = '\n'.join(session_info)
	session_txt_path.write_text(session_write)


main(path_to_main_out_save_folder)
