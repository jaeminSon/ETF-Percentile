#!/usr/bin/env python3
"""
Image Processing Script
Processes images from 1.png to 7.png in all directories under "version5" to:
1. Pad them to 16:9 aspect ratio (height:width)
2. Resize to height of 2000 pixels
"""

import os
import sys
from PIL import Image, ImageOps
import math

def process_image(input_path, output_path, target_height=2000, target_ratio=16/9):
    """
    Process a single image to match the target aspect ratio and height.
    
    Args:
        input_path (str): Path to input image
        output_path (str): Path to save processed image
        target_height (int): Target height in pixels (default: 2000)
        target_ratio (float): Target aspect ratio height/width (default: 16/9)
    """
    try:
        # Open the image
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (in case of RGBA or other modes)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Calculate target width based on height and ratio
            target_width = int(target_height / target_ratio)
            
            # Get current dimensions
            current_width, current_height = img.size
            
            # Calculate current aspect ratio
            current_ratio = current_height / current_width
            
            # Calculate padding needed
            if current_ratio > target_ratio:
                # Image is too tall, need to pad width
                new_width = int(current_height / target_ratio)
                new_height = current_height
                pad_width = new_width - current_width
                pad_height = 0
            else:
                # Image is too wide, need to pad height
                new_width = current_width
                new_height = int(current_width * target_ratio)
                pad_width = 0
                pad_height = new_height - current_height
            
            # Create new image with padding
            new_img = Image.new('RGB', (new_width, new_height), (255, 255, 255))  # White background
            
            # Calculate position to center the original image
            x_offset = pad_width // 2
            y_offset = pad_height // 2
            
            # Paste the original image centered
            new_img.paste(img, (x_offset, y_offset))
            
            # Resize to target height
            final_img = new_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Save the processed image
            final_img.save(output_path, 'PNG', quality=95)
            
            print(f"Processed {input_path} -> {output_path}")
            print(f"  Original size: {current_width}x{current_height}")
            print(f"  Final size: {target_width}x{target_height}")
            print(f"  Padding added: {pad_width}px width, {pad_height}px height")
            
    except FileNotFoundError:
        print(f"Error: File {input_path} not found")
    except Exception as e:
        print(f"Error processing {input_path}: {str(e)}")

def process_directory(directory_path, output_base_dir):
    """
    Process all images from 1.png to 7.png in a specific directory.
    
    Args:
        directory_path (str): Path to the directory containing images
        output_base_dir (str): Base directory for output
    """
    dir_name = os.path.basename(directory_path)
    output_dir = os.path.join(output_base_dir, dir_name)
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")
    
    # Process images from 1.png to 7.png
    for i in range(1, 8):
        input_filename = f"{i}.png"
        output_filename = f"{i}_processed.png"
        input_path = os.path.join(directory_path, input_filename)
        output_path = os.path.join(output_dir, output_filename)
        
        if os.path.exists(input_path):
            process_image(input_path, output_path)
        else:
            print(f"Warning: {input_path} not found, skipping...")

def main():
    """Main function to process all directories under 'version5'"""
    version5_path = "version5"
    
    # Check if version5 directory exists
    if not os.path.exists(version5_path):
        print(f"Error: Directory '{version5_path}' not found")
        return
    
    # Create main output directory
    output_base_dir = "processed_images"
    if not os.path.exists(output_base_dir):
        os.makedirs(output_base_dir)
        print(f"Created main output directory: {output_base_dir}")
    
    # Get all subdirectories under version5
    subdirs = []
    for item in os.listdir(version5_path):
        item_path = os.path.join(version5_path, item)
        if os.path.isdir(item_path):
            subdirs.append(item_path)
    
    if not subdirs:
        print(f"No subdirectories found in '{version5_path}'")
        return
    
    print(f"Found {len(subdirs)} subdirectories in '{version5_path}':")
    for subdir in subdirs:
        print(f"  - {os.path.basename(subdir)}")
    
    print("\nProcessing images in each subdirectory...")
    
    # Process each subdirectory
    for subdir in subdirs:
        print(f"\n--- Processing directory: {os.path.basename(subdir)} ---")
        process_directory(subdir, output_base_dir)
    
    print(f"\nProcessing complete!")
    print(f"All processed images saved in: {output_base_dir}/")

if __name__ == "__main__":
    main() 