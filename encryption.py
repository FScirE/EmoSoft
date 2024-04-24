from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import scrypt
from Crypto.Util.Padding import pad, unpad
import multiprocessing
import os
import sys
import time

# Function to generate a key
def write_key():
    salt = get_random_bytes(16)
    key = scrypt('my_password', salt, key_len=32, N=2**20, r=8, p=1)
    with open("secret.key", "wb") as key_file:
        key_file.write(key)
    return salt

# Function to load the key
def load_key(salt):
    key = scrypt('my_password', salt, key_len=32, N=2**20, r=8, p=1)
    return key

# Encrypt a message
def encrypt_message(message, key):
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(message.encode('utf-8'), AES.block_size))
    return cipher.iv + ct_bytes

# Decrypt a message
def decrypt_message(enc_message, key):
    iv = enc_message[:16]
    ct = enc_message[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), AES.block_size)
    return pt.decode('utf-8')

def load_password_to_shared_memory(password: str):
    # NOT TESTED
    
    password = password.encode("ascii")
    
    shared_buffer = sys.argv[1]
    shared_array = multiprocessing.RawArray('i', shared_buffer)
    
    for i, c in enumerate(password):
        shared_array[i] = c
    
    print("done " + str(len(password)))
    
    time.sleep(5)
    
    

# Main flow
if __name__ == "__main__":
    # TODO: call load_password_to_shared_memory
    
    salt = write_key()  # Generate and save a new key
    
    # Load the key
    key = load_key(salt)

    # Encrypt login information
    encrypted_username = encrypt_message("MyUsername", key)
    encrypted_password = encrypt_message("MyPassword", key)

    print("Encrypted username:", encrypted_username)
    print("Encrypted password:", encrypted_password)

    # Decrypt login information
    decrypted_username = decrypt_message(encrypted_username, key)
    decrypted_password = decrypt_message(encrypted_password, key)

    print("Decrypted username:", decrypted_username)
    print("Decrypted password:", decrypted_password)
