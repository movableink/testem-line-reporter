var colors = require('colors/safe');

function FailureReporter(silent, out) {
  this.out = out || process.stdout;
  this.silent = silent;
  this.total = 0;
  this.fail = 0;
  this.pass = 0;  // used by ci/index.js getExitCode
  this.skipped = 0;
}

FailureReporter.prototype = {
  report: function(prefix, data) {
    this.display(prefix, data);
    this.total++;
    if (data.skipped) {
      this.skipped++;
    } else if (data.passed) {
      this.pass++;
    } else {
      this.fail++;
    }
  },

  display: function(prefix, result) {
    if (result.skipped) {
      this.out.write(colors.yellow('*'));
      return;
    }

    if (result.passed) {
      this.out.write(colors.green('.'));
      return;
    }

    this.out.write('\n' + colors.red('F ' + result.name.trim())+': ');
    // result.error.message is the whole stack trace
    var lines = result.error.message.split('\n');
    var last = lines[lines.length-1].split(': ');
    // at http://localhost:7357/assets/test-support.js:5463: No model was found for 'user'
    // line number and file aren't useful because it's the concatenated file
    if (last.length > 1) {
      this.out.write(last[1]+'\n');
    } else {
      this.out.write(lines[lines.length-1]+'\n');
    }

    this.out.write(result.error.message.replace(/\n/g, '\n    ') + '\n');
  },

  finish: function() {
    if (this.silent) {
      return;
    }

    var summary = this.fail+'/'+this.total+' failed\n';

    this.out.write('\n');
    if (this.fail === 0) {
      this.out.write(colors.green(summary));
    } else {
      this.out.write(colors.red(summary));
    }
  }
};

module.exports = FailureReporter;
