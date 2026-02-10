/**
 * Accessibility Dashboard UI
 * Displays accessibility audit results, statistics, and management tools
 */

import { accessibilityManager, type AccessibilityAuditResult, type AccessibilityIssue } from './accessibilitySystem';
import { notificationManager } from './notificationSystem';

export class AccessibilityDashboardUI {
  private container: HTMLElement | null = null;
  private lastAuditResult: AccessibilityAuditResult | null = null;

  /**
   * Render the accessibility dashboard
   */
  render(parentElement: HTMLElement): void {
    this.container = document.createElement('section');
    this.container.id = 'accessibility-section';
    this.container.className = 'section';
    this.container.setAttribute('aria-labelledby', 'accessibility-heading');

    const heading = document.createElement('h2');
    heading.id = 'accessibility-heading';
    heading.textContent = '♿ Accessibility Audit';
    heading.className = 'section-heading';

    const description = document.createElement('p');
    description.className = 'section-description';
    description.textContent = 'Comprehensive accessibility testing and WCAG compliance monitoring for Chimera.';

    this.container.appendChild(heading);
    this.container.appendChild(description);

    // Render controls
    this.renderControls();

    // Render stats
    this.renderStats();

    // Render audit results if available
    if (this.lastAuditResult) {
      this.renderAuditResults();
    }

    parentElement.appendChild(this.container);
  }

  /**
   * Render audit controls
   */
  private renderControls(): void {
    if (!this.container) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'accessibility-controls';
    controlsDiv.setAttribute('role', 'group');
    controlsDiv.setAttribute('aria-label', 'Accessibility controls');

    const runAuditButton = document.createElement('button');
    runAuditButton.className = 'btn btn-primary';
    runAuditButton.textContent = '🔍 Run Accessibility Audit';
    runAuditButton.setAttribute('aria-label', 'Run accessibility audit on current page');
    runAuditButton.addEventListener('click', () => this.runAudit());

    const announceButton = document.createElement('button');
    announceButton.className = 'btn';
    announceButton.textContent = '📢 Test Announcement';
    announceButton.setAttribute('aria-label', 'Test screen reader announcement');
    announceButton.addEventListener('click', () => this.testAnnouncement());

    controlsDiv.appendChild(runAuditButton);
    controlsDiv.appendChild(announceButton);

    this.container.appendChild(controlsDiv);
  }

  /**
   * Render accessibility statistics
   */
  private renderStats(): void {
    if (!this.container) return;

    const stats = accessibilityManager.getStats();

    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    statsGrid.setAttribute('role', 'group');
    statsGrid.setAttribute('aria-label', 'Accessibility statistics');

    const createStatCard = (label: string, value: string, status: boolean, icon: string) => {
      const card = document.createElement('div');
      card.className = `stat-card ${status ? 'stat-success' : 'stat-warning'}`;
      card.setAttribute('role', 'status');
      card.setAttribute('aria-label', `${label}: ${value}`);

      const iconSpan = document.createElement('span');
      iconSpan.className = 'stat-icon';
      iconSpan.textContent = icon;
      iconSpan.setAttribute('aria-hidden', 'true');

      const labelSpan = document.createElement('span');
      labelSpan.className = 'stat-label';
      labelSpan.textContent = label;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'stat-value';
      valueSpan.textContent = value;

      card.appendChild(iconSpan);
      card.appendChild(labelSpan);
      card.appendChild(valueSpan);

      return card;
    };

    statsGrid.appendChild(
      createStatCard(
        'Screen Reader Support',
        stats.hasLiveRegions ? 'Enabled' : 'Disabled',
        stats.hasLiveRegions,
        '🔊'
      )
    );

    statsGrid.appendChild(
      createStatCard(
        'Skip Links',
        stats.hasSkipLinks ? 'Active' : 'Inactive',
        stats.hasSkipLinks,
        '⏭️'
      )
    );

    statsGrid.appendChild(
      createStatCard(
        'Keyboard Navigation',
        stats.keyboardNavEnabled ? 'Enabled' : 'Disabled',
        stats.keyboardNavEnabled,
        '⌨️'
      )
    );

    if (this.lastAuditResult) {
      statsGrid.appendChild(
        createStatCard(
          'Accessibility Score',
          `${this.lastAuditResult.score}/100`,
          this.lastAuditResult.score >= 80,
          '📊'
        )
      );
    }

    this.container.appendChild(statsGrid);
  }

  /**
   * Render audit results
   */
  private renderAuditResults(): void {
    if (!this.container || !this.lastAuditResult) return;

    const resultsSection = document.createElement('div');
    resultsSection.className = 'audit-results';
    resultsSection.setAttribute('role', 'region');
    resultsSection.setAttribute('aria-labelledby', 'audit-results-heading');

    const heading = document.createElement('h3');
    heading.id = 'audit-results-heading';
    heading.textContent = '📋 Audit Results';

    const timestamp = document.createElement('p');
    timestamp.className = 'audit-timestamp';
    timestamp.textContent = `Last audit: ${this.lastAuditResult.timestamp.toLocaleString()}`;

    resultsSection.appendChild(heading);
    resultsSection.appendChild(timestamp);

    // Summary stats
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'audit-summary';
    summaryDiv.setAttribute('role', 'group');
    summaryDiv.setAttribute('aria-label', 'Audit summary');

    const createSummaryItem = (label: string, count: number, severity: string) => {
      const item = document.createElement('div');
      item.className = `summary-item severity-${severity}`;
      item.setAttribute('aria-label', `${count} ${label} issues`);

      const countSpan = document.createElement('span');
      countSpan.className = 'summary-count';
      countSpan.textContent = count.toString();

      const labelSpan = document.createElement('span');
      labelSpan.className = 'summary-label';
      labelSpan.textContent = label;

      item.appendChild(countSpan);
      item.appendChild(labelSpan);

      return item;
    };

    summaryDiv.appendChild(createSummaryItem('Critical', this.lastAuditResult.criticalIssues, 'critical'));
    summaryDiv.appendChild(createSummaryItem('Serious', this.lastAuditResult.seriousIssues, 'serious'));
    summaryDiv.appendChild(createSummaryItem('Moderate', this.lastAuditResult.moderateIssues, 'moderate'));
    summaryDiv.appendChild(createSummaryItem('Minor', this.lastAuditResult.minorIssues, 'minor'));

    resultsSection.appendChild(summaryDiv);

    // Issues list
    if (this.lastAuditResult.issues.length > 0) {
      const issuesHeading = document.createElement('h4');
      issuesHeading.textContent = 'Issues Found';

      const issuesList = document.createElement('div');
      issuesList.className = 'issues-list';
      issuesList.setAttribute('role', 'list');
      issuesList.setAttribute('aria-label', 'Accessibility issues');

      this.lastAuditResult.issues.forEach((issue, index) => {
        const issueCard = this.createIssueCard(issue, index);
        issuesList.appendChild(issueCard);
      });

      resultsSection.appendChild(issuesHeading);
      resultsSection.appendChild(issuesList);
    } else {
      const successMessage = document.createElement('p');
      successMessage.className = 'audit-success';
      successMessage.textContent = '✅ No accessibility issues found! Great work!';
      successMessage.setAttribute('role', 'status');
      resultsSection.appendChild(successMessage);
    }

    this.container.appendChild(resultsSection);
  }

  /**
   * Create issue card element
   */
  private createIssueCard(issue: AccessibilityIssue, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = `issue-card severity-${issue.severity}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `Issue ${index + 1}: ${issue.issue}`);

    const header = document.createElement('div');
    header.className = 'issue-header';

    const severityBadge = document.createElement('span');
    severityBadge.className = `severity-badge severity-${issue.severity}`;
    severityBadge.textContent = issue.severity.toUpperCase();
    severityBadge.setAttribute('aria-label', `Severity: ${issue.severity}`);

    const wcagBadge = document.createElement('span');
    wcagBadge.className = 'wcag-badge';
    wcagBadge.textContent = `WCAG ${issue.wcagLevel}`;
    wcagBadge.setAttribute('aria-label', `WCAG Level ${issue.wcagLevel}`);

    header.appendChild(severityBadge);
    header.appendChild(wcagBadge);

    const element = document.createElement('div');
    element.className = 'issue-element';
    element.textContent = `Element: ${issue.element}`;

    const description = document.createElement('div');
    description.className = 'issue-description';
    description.textContent = issue.issue;

    const recommendation = document.createElement('div');
    recommendation.className = 'issue-recommendation';
    recommendation.innerHTML = `<strong>Recommendation:</strong> ${issue.recommendation}`;

    card.appendChild(header);
    card.appendChild(element);
    card.appendChild(description);
    card.appendChild(recommendation);

    return card;
  }

  /**
   * Run accessibility audit
   */
  private runAudit(): void {
    accessibilityManager.announce('Running accessibility audit', { politeness: 'assertive' });
    notificationManager.show('Running accessibility audit...', { type: 'info' });

    // Run audit with a slight delay to let the notification appear
    setTimeout(() => {
      this.lastAuditResult = accessibilityManager.audit();

      // Clear previous results and re-render
      if (this.container) {
        this.container.innerHTML = '';
        const heading = document.createElement('h2');
        heading.id = 'accessibility-heading';
        heading.textContent = '♿ Accessibility Audit';
        heading.className = 'section-heading';

        const description = document.createElement('p');
        description.className = 'section-description';
        description.textContent = 'Comprehensive accessibility testing and WCAG compliance monitoring for Chimera.';

        this.container.appendChild(heading);
        this.container.appendChild(description);
        this.renderControls();
        this.renderStats();
        this.renderAuditResults();
      }

      const message = this.lastAuditResult.totalIssues === 0
        ? '✅ Audit complete! No issues found.'
        : `Audit complete. Found ${this.lastAuditResult.totalIssues} issue${this.lastAuditResult.totalIssues > 1 ? 's' : ''}. Score: ${this.lastAuditResult.score}/100`;

      notificationManager.show(message, { 
        type: this.lastAuditResult.score >= 80 ? 'success' : 'warning' 
      });
      accessibilityManager.announce(message, { politeness: 'assertive' });
    }, 100);
  }

  /**
   * Test screen reader announcement
   */
  private testAnnouncement(): void {
    const message = 'This is a test announcement for screen readers. If you can hear this, screen reader support is working correctly!';
    accessibilityManager.announce(message, { politeness: 'assertive' });
    notificationManager.show('Announcement sent to screen readers', { type: 'success' });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
