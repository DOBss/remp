#! /usr/bin/make

.PHONY: install run-only

.DEFAULT_GOAL := help

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies to python virtual environment
	python3 -m venv .virtualenv; \
	source .virtualenv/bin/activate; \
	pip3 install -r requirements.txt; \

run-only: ## Run jupyter notebook
	source .virtualenv/bin/activate; \
	jupyter notebook; \

run: install run-only ## Install dependencies (see install command) and run jupyter notebook

clean: ## Remove virtualenv
	rm -rf .virtualenv
