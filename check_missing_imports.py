#!/usr/bin/env python3
"""
Check for missing imports and calls to non-existent modules
"""

import ast
import os
from pathlib import Path
from typing import List, Dict, Set

class ImportChecker:
    """Check for missing imports and calls"""
    
    def __init__(self):
        self.base_path = Path("c:/Sallie")
        self.issues = []
        self.all_files = []
        
    def find_python_files(self):
        """Find all Python files"""
        for root, dirs, files in os.walk(self.base_path):
            # Skip certain directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__' and 'node_modules' not in d]
            
            for file in files:
                if file.endswith('.py'):
                    self.all_files.append(Path(root) / file)
    
    def check_file_imports(self, file_path):
        """Check imports in a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse AST
            tree = ast.parse(content)
            
            imports = []
            calls = []
            
            # Find all imports and calls
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ''
                    for alias in node.names:
                        imports.append(f"{module}.{alias.name}" if module else alias.name)
                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        calls.append(node.func.id)
                    elif isinstance(node.func, ast.Attribute):
                        # Get the full attribute path
                        parts = []
                        current = node.func
                        while isinstance(current, ast.Attribute):
                            parts.append(current.attr)
                            current = current.value
                        if isinstance(current, ast.Name):
                            parts.append(current.id)
                        full_path = '.'.join(reversed(parts))
                        calls.append(full_path)
            
            # Check if imports exist
            for imp in imports:
                if not self.check_import_exists(imp, file_path):
                    self.issues.append(f"❌ {file_path.name}: Import not found - {imp}")
            
            # Check if called functions exist
            for call in calls:
                if not self.check_call_exists(call, file_path, content):
                    self.issues.append(f"❌ {file_path.name}: Call to non-existent - {call}")
                    
        except Exception as e:
            self.issues.append(f"❌ {file_path.name}: Error checking file - {e}")
    
    def check_import_exists(self, import_name: str, file_path: Path) -> bool:
        """Check if an import exists"""
        # Skip standard library imports
        stdlib_modules = {
            'os', 'sys', 'json', 'time', 'datetime', 'pathlib', 'asyncio', 
            'logging', 'typing', 'collections', 'itertools', 'functools',
            're', 'math', 'random', 'hashlib', 'base64', 'urllib', 'http',
            'socket', 'threading', 'multiprocessing', 'subprocess',
            'tempfile', 'shutil', 'glob', 'fnmatch', 'pickle', 'csv',
            'xml', 'sqlite3', 'unittest', 'argparse', 'configparser'
        }
        
        # Skip external packages that might be installed
        external_packages = {
            'fastapi', 'uvicorn', 'pydantic', 'requests', 'aiohttp',
            'numpy', 'pandas', 'torch', 'tensorflow', 'transformers',
            'diffusers', 'audiocraft', 'whisper', 'vosk', 'speech_recognition',
            'react', 'react-native', 'typescript', 'node', 'npm'
        }
        
        # Check if it's a relative import
        if import_name.startswith('.'):
            return True  # Assume relative imports are handled
        
        # Get the base module name
        base_module = import_name.split('.')[0]
        
        # Skip standard library
        if base_module in stdlib_modules:
            return True
        
        # Skip external packages
        if base_module in external_packages:
            return True
        
        # Check if it's a local module
        module_path = self.base_path / base_module.replace('.', '/')
        if module_path.exists() or (module_path / '__init__.py').exists():
            return True
        
        # Check in progeny_root
        progeny_path = self.base_path / 'progeny_root' / base_module.replace('.', '/')
        if progeny_path.exists() or (progeny_path / '__init__.py').exists():
            return True
        
        # Check in core
        core_path = self.base_path / 'progeny_root' / 'core' / base_module.replace('.', '/')
        if core_path.exists() or (core_path / '__init__.py').exists():
            return True
        
        return False
    
    def check_call_exists(self, call_name: str, file_path: Path, content: str) -> bool:
        """Check if a called function exists"""
        # Skip built-in functions
        builtin_functions = {
            'print', 'len', 'str', 'int', 'float', 'bool', 'list', 'dict',
            'set', 'tuple', 'range', 'enumerate', 'zip', 'map', 'filter',
            'sum', 'max', 'min', 'abs', 'round', 'sorted', 'reversed',
            'open', 'input', 'isinstance', 'type', 'hasattr', 'getattr',
            'setattr', 'delattr', 'callable', 'iter', 'next', 'any', 'all'
        }
        
        # Get the base function name
        if '.' in call_name:
            base_func = call_name.split('.')[-1]
        else:
            base_func = call_name
        
        # Skip built-ins
        if base_func in builtin_functions:
            return True
        
        # Skip method calls (they're dynamic)
        if '.' in call_name and len(call_name.split('.')) > 1:
            return True
        
        # Check if function is defined in the same file
        if f"def {base_func}(" in content or f"async def {base_func}(" in content:
            return True
        
        # Skip common API calls
        if call_name in ['app.get', 'app.post', 'app.put', 'app.delete', 'app.include_router']:
            return True
        
        return False
    
    def check_main_file_specifically(self):
        """Check main.py specifically for missing imports"""
        main_file = self.base_path / "progeny_root/core/main.py"
        
        if not main_file.exists():
            self.issues.append("❌ main.py not found")
            return
        
        try:
            with open(main_file, 'r') as f:
                content = f.read()
            
            # Check for specific problematic imports
            problematic_imports = [
                'from agency import AgencySystem',
                'from limbic import LimbicSystem',
                'from communication.monologue import MonologueSystem',
                'from convergence import ConvergenceSystem',
                'from identity import get_identity_system',
                'from control import get_control_system',
                'from avatar import get_avatar_system',
                'from sync import SyncClient',
                'from smart_home import SmartHomeAPI',
                'from performance import get_performance_monitor'
            ]
            
            for imp in problematic_imports:
                if imp in content:
                    # Check if there's a try/except around it
                    if 'try:' in content and imp in content.split('try:')[1].split('except:')[0]:
                        continue  # It's handled with try/except
                    else:
                        self.issues.append(f"❌ main.py: Unhandled import - {imp}")
            
            # Check for the availability flags
            required_flags = [
                'LIMBIC_AVAILABLE',
                'MEMORY_AVAILABLE',
                'AGENCY_AVAILABLE',
                'MONOLOGUE_AVAILABLE',
                'CONVERGENCE_AVAILABLE',
                'IDENTITY_AVAILABLE',
                'CONTROL_AVAILABLE',
                'AVATAR_AVAILABLE',
                'SYNC_AVAILABLE',
                'SMART_HOME_AVAILABLE',
                'PERFORMANCE_AVAILABLE'
            ]
            
            for flag in required_flags:
                if flag not in content:
                    self.issues.append(f"❌ main.py: Missing availability flag - {flag}")
                    
        except Exception as e:
            self.issues.append(f"❌ Error checking main.py: {e}")
    
    def run_check(self):
        """Run the complete check"""
        print("🔍 Checking for missing imports and calls...")
        
        # Find all Python files
        self.find_python_files()
        print(f"📁 Found {len(self.all_files)} Python files")
        
        # Check main.py specifically
        self.check_main_file_specifically()
        
        # Check other files (limit to avoid too many checks)
        important_files = [
            f for f in self.all_files 
            if 'main.py' in str(f) or 'preview_server.py' in str(f) or 'launcher.py' in str(f)
        ]
        
        for file_path in important_files[:10]:  # Limit to 10 files
            print(f"🔍 Checking {file_path.name}...")
            self.check_file_imports(file_path)
        
        return self.issues

def main():
    """Main checker"""
    print("🔍 MISSING IMPORTS AND CALLS CHECK")
    print("=" * 50)
    
    checker = ImportChecker()
    issues = checker.run_check()
    
    print("\n" + "=" * 50)
    print("📊 CHECK RESULTS")
    print("=" * 50)
    
    if not issues:
        print("✅ No missing imports or calls found!")
        print("✅ All imports are properly handled")
    else:
        print(f"⚠️ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  {issue}")
    
    return issues

if __name__ == "__main__":
    main()
