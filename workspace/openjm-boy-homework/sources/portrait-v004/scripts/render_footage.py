"""Rebuild the four camera-path plates; retain the independently rendered native portrait ending."""
from render_camera import render
import argparse
a=argparse.ArgumentParser();a.add_argument("--only");render(a.parse_args().only)
