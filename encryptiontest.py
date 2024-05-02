import os
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import scrypt
from Crypto.Util.Padding import pad, unpad

def write_key():
    salt = get_random_bytes(16)
    key = scrypt(os.environ.get('ENCRYPTION_PASSWORD', 'default_password').encode(), salt, key_len=32, N=2**20, r=8, p=1)
    with open("secret.key", "wb") as key_file:
        key_file.write(key + salt)  # Save both key and salt securely
    return key, salt

def load_key():
    with open("secret.key", "rb") as key_file:
        key_data = key_file.read()
        key = key_data[:32]
        salt = key_data[32:]
    return key, salt

def encrypt_message(message, key):
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(message.encode('utf-8'), AES.block_size))
    return cipher.iv + ct_bytes

def decrypt_message(enc_message, key):
    iv = enc_message[:16]
    ct = enc_message[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), AES.block_size)
    return pt.decode('utf-8')

def read_env_file(filepath):
    """Read the .env file and return its contents as a dictionary, safely handling errors."""
    env_vars = {}
    with open(filepath, 'r') as file:
        for line in file:
            if "=" in line:  # Check if '=' is in the line
                key, value = line.strip().split('=', 1)
                env_vars[key] = value
            else:
                print(f"Skipping malformed line: {line.strip()}")
    return env_vars




if __name__ == "__main__":
    try:
        env_contents = read_env_file("envNeurosity.env")  # Ensure the path is correct
        
        key, salt = write_key()  # Generate and save a new key
        
        # Load the key (you should pass salt here, based on your original function definitions)
        key = load_key()[0]  # Adjusted to match the returned values (key, salt)

        # Encrypt the contents of the .env file
        encrypted_data = {}
        for env_key, value in env_contents.items():
            encrypted_data[env_key] = encrypt_message(value, key).hex()  # Convert bytes to hex for readability

        print("Encrypted data:", encrypted_data)

        # Optionally, decrypt the data to verify
        decrypted_data = {}
        for env_key, value in encrypted_data.items():
            decrypted_data[env_key] = decrypt_message(bytes.fromhex(value), key)  # Convert hex back to bytes

        print("Decrypted data:", decrypted_data)
    except Exception as e:
        print(f"An error occurred: {e}")
