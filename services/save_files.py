import os, requests 

async def save_image_url(save_location, image_url, filename):
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(os.path.join(save_location, filename), 'wb') as f:
            f.write(response.content)
        return filename
    else:
        return False