# README

## How to run

There are two options how to run Pythia's jupyter notebook.

### Install it within virtualenv

```
make run
```

URL: [http://localhost:8888/notebooks/rg-data-qa-notebok.ipynb](http://localhost:8888/notebooks/rg-data-qa-notebok.ipynb)

For more commands, check help:

```
make help
```

### Run it within docker container

```
docker pull jupyter/nbviewer
docker run -p 8889:8080 -v $(pwd):/tmp jupyter/nbviewer python3 -m nbviewer --localfiles=/tmp --port=8080 --debug --no-cache
```

URL: [http://localhost:8889/localfile/rg-data-qa-notebok.ipynb](http://localhost:8889/localfile/rg-data-qa-notebok.ipynb)


## Dependencies

- Python 3 & pip.
- Python 3 devel package & MySQL/MariaDB devel package
   - Fedora: `sudo dnf install python3-devel mysql-devel`
   - Ubuntu: `sudo apt-get install python3-dev mysql-devel`
- Project dependencies are listed in file [requirements.txt](requirements.txt). Use pip to install it: `pip3 install -r requirements.txt`

### Other dependencies

Fedora needs package `redhat-rpm-config`. Use `sudo dnf install redhat-rpm-config`. Solves issue `gcc: error: /usr/lib/rpm/redhat/redhat-hardened-cc1: No such file or directory`.


