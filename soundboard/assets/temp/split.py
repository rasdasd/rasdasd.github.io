from pydub import AudioSegment, silence

# Load the audio file
audio = AudioSegment.from_file("orig.mp3")

# Split on silence
chunks = silence.split_on_silence(audio, min_silence_len=400, silence_thresh=-60)

# Export each chunk
for i, chunk in enumerate(chunks):
    chunk.export(f"{i}.mp3", format="mp3")
