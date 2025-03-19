#!/bin/bash

# Directory where images will be saved
read -p "Enter the directory where you want to save images: " save_dir

# Create the directory if it does not exist
mkdir -p "$save_dir"

# Fetch each URL from the file and download the image
while IFS= read -r url
do
  # Generate MD5 hash of the URL
  md5=$(echo -n "$url" | md5sum | awk '{print $1}')

  # Use the MD5 hash as the filename
  wget -O "$save_dir/$md5.jpg" "$url"
done < "API/BTL/img__tranh/images.txt"

echo "Download completed. Images saved to $save_dir."
