import unittest
from encryptiontest import *

class TestFindDefinition(unittest.TestCase):
    def test_encrypt_and_decrypt(self):
        psw="abcd1234!?#"
        key, salt = write_key()  # Generate and save a new key
        
        # Load the key (you should pass salt here, based on your original function definitions)
        key = load_key()[0]  # Adjusted to match the returned values (key, salt)
        psw=encrypt_message(psw, key)
        psw_after=decrypt_message(psw, key)

        psw="abcd1234!?#"
        
        self.assertEqual(psw,psw_after, "Password after is not equal to password before.")

    def test_encrypt(self):
        psw="abcd1?#"
        key, salt = write_key()  # Generate and save a new key
        
        # Load the key (you should pass salt here, based on your original function definitions)
        key = load_key()[0]  # Adjusted to match the returned values (key, salt)
        psw_after=encrypt_message(psw, key)
        
        self.assertNotEqual(psw,psw_after,"Encryption encrypts msg same as input.")
        
        
    def test_key_write_and_load(self):
        
        # Test key writing and loading
        original_key, original_salt = write_key()
        loaded_key, loaded_salt = load_key()
        self.assertEqual(original_key, loaded_key)
        self.assertEqual(original_salt, loaded_salt)
    
    def test_read_env_file(self):
        # Test reading .env file
        test_env_content = "KEY=value\nMALFORMED_LINE\nPASSWORD=secret"
        test_env_path = "test.env"
        with open(test_env_path, 'w') as file:
            file.write(test_env_content)
        
        env_vars = read_env_file(test_env_path)
        os.remove(test_env_path)  # Cleanup test file

        self.assertIn("KEY", env_vars)
        self.assertEqual(env_vars["KEY"], "value")
        self.assertNotIn("MALFORMED_LINE", env_vars)
        self.assertIn("PASSWORD", env_vars)
        self.assertEqual(env_vars["PASSWORD"], "secret")    



if __name__ == '__main__':
    unittest.main()
    