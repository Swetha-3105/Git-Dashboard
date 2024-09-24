document.addEventListener('DOMContentLoaded', () => {
    var fetchPrsBtn = document.getElementById('fetchPrsBtn');
    var repoOwnerInput = document.getElementById('repoOwner');
    var repoNameInput = document.getElementById('repoName');
    var prList = document.getElementById('pr-list');
    var prDetails = document.getElementById('pr-details');
    var prChartCtx = document.getElementById('prChart').getContext('2d');
    var pieChartCtx = document.getElementById('pieChart').getContext('2d');

    var prChart, pieChart;

    fetchPrsBtn.addEventListener('click', async () => {
        var repoOwner = repoOwnerInput.value;
        var repoName = repoNameInput.value;

        // Fetch both open and closed PRs
        var response = await fetch(`/api/prs/${repoOwner}/${repoName}/all`);
        var prs = await response.json();

        console.log("API Response:", prs); // Debugging: Log API response

        prList.innerHTML = '';
        prDetails.innerHTML = '';

        // Separate open and closed PRs
        var openPrs = prs.filter(pr => pr.state === 'open');
        var closedPrs = prs.filter(pr => pr.state === 'closed');

        // Create headers for Open and Closed PRs
        var openPrsHeader = document.createElement('h3');
        openPrsHeader.textContent = "Open PRs";
        prList.appendChild(openPrsHeader);

        openPrs.forEach(pr => {
            var prItem = document.createElement('div');
            prItem.classList.add('pr-item');
            prItem.textContent = `${pr.title} (PR #${pr.number})`;

            // Event listener for PR click to display details and update chart
            prItem.addEventListener('click', async () => {
                var prResponse = await fetch(`/api/prs/${repoOwner}/${repoName}/${pr.number}`);
                var prData = await prResponse.json();

                // Update the PR details section
                prDetails.innerHTML = `
                    <h2>${prData.title}</h2>
                    <p>Submitted by: ${prData.user.login}</p>
                    <p>Created at: ${prData.created_at}</p>
                    <p>Status: ${prData.state}</p>
                    <p>Comments: ${pr.comments}</p>
                    <p>Review Comments Count: ${prData.review_comments || 0}</p>
                `;

                // Prepare data for PR-specific chart (customized for each PR)
                if (prChart) prChart.destroy(); // Destroy previous chart

                // Create a new bar chart for the selected PR details
                prChart = new Chart(prChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Comments', 'Review Comments'],
                        datasets: [{
                            label: `PR #${prData.number}: ${prData.title}`,
                            data: [pr.comments, prData.review_comments || 0],  // Set the comments and review comments as data
                            backgroundColor: ['#36A2EB', '#FF6384'] // Custom colors
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1 // Ensure the step size fits your data
                                }
                            }
                        }
                    }
                });

                // Update the chart title
                prChart.options.plugins.title = {
                    display: true,
                    text: `PR Details: ${prData.title} \n Submitted by: ${prData.user.login} \n Created at: ${new Date(prData.created_at).toLocaleString()}`,
                    font: {
                        size: 14,
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                };
                prChart.update(); // Update the chart to reflect the new title
            });

            prList.appendChild(prItem);
        });

        var closedPrsHeader = document.createElement('h3');
        closedPrsHeader.textContent = "Closed PRs";
        prList.appendChild(closedPrsHeader);

        closedPrs.forEach(pr => {
            var prItem = document.createElement('div');
            prItem.classList.add('pr-item');
            prItem.textContent = `${pr.title} (PR #${pr.number})`;

            prItem.addEventListener('click', async () => {
                var prResponse = await fetch(`/api/prs/${repoOwner}/${repoName}/${pr.number}`);
                var prData = await prResponse.json();

                prDetails.innerHTML = `
                    <h2>${prData.title}</h2>
                    <p>Submitted by: ${prData.user.login}</p>
                    <p>Created at: ${prData.created_at}</p>
                    <p>Status: ${prData.state}</p>
                    <p>Comments: ${pr.comments}</p>
                    <p>Review Comments Count: ${prData.review_comments || 0}</p>
                `;

                if (prChart) prChart.destroy(); // Destroy previous chart

                prChart = new Chart(prChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Comments', 'Review Comments'],
                        datasets: [{
                            label: `PR #${prData.number}: ${prData.title}`,
                            data: [pr.comments, prData.review_comments || 0],
                            backgroundColor: ['#36A2EB', '#FF6384']
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });

                // Update the chart title
                prChart.options.plugins.title = {
                    display: true,
                    text: `PR Details: ${prData.title} \n Submitted by: ${prData.user.login} \n Created at: ${new Date(prData.created_at).toLocaleString()}`,
                    font: {
                        size: 14,
                    },
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                };
                prChart.update(); // Update the chart to reflect the new title
            });

            prList.appendChild(prItem);
        });

        // Prepare data for the bar chart (PR Count)
        var openPrCount = openPrs.length;
        var closedPrCount = closedPrs.length;

        if (prChart) prChart.destroy(); // Destroy previous chart

        prChart = new Chart(prChartCtx, {
            type: 'bar',
            data: {
                labels: ['Open PRs', 'Closed PRs'],
                datasets: [{
                    label: 'PR Count',
                    data: [openPrCount, closedPrCount],
                    backgroundColor: ['#36A2EB', '#FF6384']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1 // Set step size for y-axis
                        }
                    }
                }
            }
        });

        // Prepare data for the pie chart (Open vs Closed PRs)
        if (pieChart) pieChart.destroy(); // Destroy previous pie chart

        pieChart = new Chart(pieChartCtx, {
            type: 'pie',
            data: {
                labels: ['Open', 'Closed'],
                datasets: [{
                    data: [openPrCount, closedPrCount],
                    backgroundColor: ['#36A2EB', '#FF6384'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            let total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                            let percentage = (value / total * 100).toFixed(1) + '%'; // Show percentage
                            return `${value} (${percentage})`; // Display both count and percentage
                        },
                        color: '#fff', // Text color inside the pie
                        font: {
                            size: 14, // Font size
                        }
                    }
                }
            },
            plugins: [ChartDataLabels] // Load the datalabels plugin
        });
    });
});
