from flask import Flask, render_template, jsonify,redirect
import requests
import ssl
import os
app = Flask(__name__)
GITHUB_API_URL = 'https://api.github.com'
TOKEN = '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'  


def fetch_prs(repo_owner, repo_name, state='all',per_page=100, page=1):
    headers = {'Authorization': f'Bearer {TOKEN}'}
    url = f"{GITHUB_API_URL}/repos/{repo_owner}/{repo_name}/pulls?state={state}"
    response = requests.get(url, headers=headers,verify=False)
    
    if response.status_code == 200:
        prs = response.json()
        
        for pr in prs:
            comments_url = pr['comments_url']
            comments_response = requests.get(comments_url, headers=headers)
            pr['comments'] = len(comments_response.json()) if comments_response.status_code == 200 else 0
        return prs
    return []

def fetch_all_prs(repo_owner, repo_name, state='all'):
    all_prs = []
    page = 1
    while True:
        prs = fetch_prs(repo_owner, repo_name, state, per_page=100, page=page)
        if not prs:
            break
        all_prs.extend(prs)
        page += 1
    return all_prs

def fetch_pr_details(repo_owner, repo_name, pr_number):
    headers = {'Authorization': f'token {TOKEN}'}
    url = f"{GITHUB_API_URL}/repos/{repo_owner}/{repo_name}/pulls/{pr_number}"
    response = requests.get(url, headers=headers,verify=False)
    return response.json() if response.status_code == 200 else {}

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/prs/<repo_owner>/<repo_name>/<state>')
def get_prs(repo_owner, repo_name, state='all'):
    prs = fetch_prs(repo_owner, repo_name, state)
    return jsonify(prs)

@app.route('/api/prs/<repo_owner>/<repo_name>/<int:pr_number>')
def get_pr_details(repo_owner, repo_name, pr_number):
    pr_details = fetch_pr_details(repo_owner, repo_name, pr_number)
    return jsonify(pr_details)

if __name__ == '__main__':
    app.run(ssl_context='adhoc')

