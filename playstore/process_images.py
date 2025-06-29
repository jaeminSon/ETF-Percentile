#!/usr/bin/env python3
"""
Image Processing Script
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

def main(dir_home, dir_save):
    """Main function to process all images from 1.png to 7.png"""
    if not os.path.exists(dir_save):
        os.makedirs(dir_save)
        print(f"Created output directory: {dir_save}")
    
    for fn in os.listdir(dir_home):
        input_path = os.path.join(dir_home, fn)
        fid = os.path.splitext(fn)[0]
        output_filename = f"{fid}_processed.png"
        output_path = os.path.join(dir_save, output_filename)
        
        if os.path.exists(input_path):
            process_image(input_path, output_path)
        else:
            print(f"Warning: {input_path} not found, skipping...")
    
    print("\nProcessing complete!")
    print(f"Processed images saved in: {dir_save}/")

if __name__ == "__main__":
    main("version5", "processed_images") 