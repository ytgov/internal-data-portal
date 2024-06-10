require 'net/http'
require 'json'
require 'uri'

class GithubApi
  GITHUB_TOKEN = ENV['GITHUB_TOKEN']
  GITHUB_REPO = 'icefoganalytics/internal-data-portal' # Format: 'owner/repo'
  GITHUB_API_BASE = 'https://api.github.com'

  def self.build_branch_name(github_issue_url)
    if GITHUB_TOKEN.nil?
      puts 'Please set GITHUB_TOKEN environment variable'
      return
    end

    issue_number = extract_issue_number(github_issue_url)
    issue_title = fetch_issue_title(issue_number)
    format_branch_name(issue_number, issue_title)
  end

  private

  def self.extract_issue_number(url)
    url.match(%r{/issues/(\d+)})[1]
  end

  def self.fetch_issue_title(issue_number)
    uri = URI("#{GITHUB_API_BASE}/repos/#{GITHUB_REPO}/issues/#{issue_number}")
    request = Net::HTTP::Get.new(uri)
    request['Authorization'] = "token #{GITHUB_TOKEN}"

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end

    data = JSON.parse(response.body)
    data['title']
  end

  def self.format_branch_name(issue_number, issue_title)
    formatted_title = issue_title.downcase.gsub(/\s+/, '-').gsub(/[^a-z0-9\-]/, '')
    "issue-#{issue_number}/#{formatted_title}"
  end
end
