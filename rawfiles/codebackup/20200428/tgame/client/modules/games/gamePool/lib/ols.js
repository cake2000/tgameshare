//https://github.com/akmiller01/NodeJS-OLS/blob/master/ols.js

const sylvester = require('sylvester');
const Pi = Math.PI;
const PiD2 = Pi / 2;
const highTThreshold = 1.96;

function StatCom(q, i, j, b) {
    let zz = 1;
    let z = zz;
    let k = i;
    while (k <= j) {
        zz = zz * q * k / (k - b);
        z = z + zz;
        k = k + 2;
    }
    return z;
}

function StudT(t, n) {
    t = Math.abs(t);
    let w = t / Math.sqrt(n);
    let th = Math.atan(w);
    if (n == 1) {
        return 1 - th / PiD2;
    }
    let sth = Math.sin(th);
    let cth = Math.cos(th);
    if ((n % 2) == 1) {
        return 1 - (th + sth * cth * StatCom(cth * cth, 2, n - 3, -1)) / PiD2;
    } else {
        return 1 - sth * StatCom(cth * cth, 1, n - 3, -1);
    }
}

function FishF(f, n1, n2) {
    let x = n2 / (n1 * f + n2)
    if ((n1 % 2) == 0) {
        return StatCom(1 - x, n2, n1 + n2 - 4, n2 - 2) * Math.pow(x, n2 / 2)
    }
    if ((n2 % 2) == 0) {
        return 1 - StatCom(x, n1, n1 + n2 - 4, n1 - 2) * Math.pow(1 - x, n1 / 2)
    }
    let th = Math.atan(Math.sqrt(n1 * f / n2));
    let a = th / PiD2;
    let sth = Math.sin(th);
    let cth = Math.cos(th)
    if (n2 > 1) {
        a = a + sth * cth * StatCom(cth * cth, 2, n2 - 3, -1) / PiD2
    }
    if (n1 == 1) {
        return 1 - a
    }
    let c = 4 * StatCom(sth * sth, n2 + 1, n1 + n2 - 4, n2 - 2) * sth * Math.pow(cth, n2) / Pi
    if (n2 == 1) {
        return 1 - a + c / 2
    }
    let k = 2;
    while (k <= (n2 - 1) / 2) {
        c = c * k / (k - .5);
        k = k + 1
    }
    return 1 - a + c
}

function reg(Y, X1, parameters) {
    let startTime = new Date().getTime();
    let Ones = sylvester.Matrix.Ones(X1.rows(), 1);
    let X = Ones.augment(X1);
    let n = X.rows();
    let k = X.cols();
    let XtransXinv = (X.transpose().x(X)).inverse();
    if (XtransXinv === null) return "Collinearity error";
    if (k >= n) return "Too few degrees of freedom for estimating unknowns (" + k + " letiables but only " + n + " observations)";
    let B = XtransXinv.x((X.transpose().x(Y)));
    let Yhat = X.x(B);
    let E = Y.subtract(Yhat);
    let S2 = (E.transpose().x(E)).x(1 / (n - B.rows())).e(1, 1);
    let RMSE = Math.sqrt(S2);
    let letCov = XtransXinv.map(function(d) {
        return d * S2;
    });
    let SE = letCov.diagonal().map(function(d) {
        return Math.sqrt(d);
    });
    let diagonalSEInverse = SE.toDiagonalMatrix().inverse();
    if (diagonalSEInverse == null) {
        return "Could not calculate Tstat"
    }
    let Tstat = B.col(1).toDiagonalMatrix().x(SE.toDiagonalMatrix().inverse()).diagonal();
    let Ybar = Y.col(1).toDiagonalMatrix().trace() / n;
    let SST = ((Y.map(function(d) {
        return d - Ybar;
    })).transpose().x((Y.map(function(d) {
            return d - Ybar;
        })))).e(1, 1);
    let R2 = 1 - ((E.transpose().x(E)).e(1, 1) / SST);
    let Fstat = ((R2 * SST) / (k - 1)) / S2;
    let AdjR2 = 1 - (((1 - R2)*(n - 1)) / (n - k));
    let result = {};
    result.overall = {
        'obs': n,
        'params': k,
        'R2': R2,
        'AdjR2': AdjR2 < 0 ? 0 : AdjR2,
        'RMSE': RMSE,
        'Fstat': Fstat,
        'Fvalue': FishF(Fstat, k - 1, n - k),
        'Time': ((new Date().getTime()) - startTime) / 1000,
        'AvgT': (Tstat.chomp(1).map(function (d) {return Math.abs(d);})).sum() / (Tstat.cols() - 1),
        'HighT': (Tstat.chomp(1).map(function (d) {return (Math.abs(d) > highTThreshold) ? 1 : 0})).sum()
    };
    for (let i = 0; i < k; i++) {
        let name = (parameters && i !== 0) ? parameters[i - 1] : 'B' + i;
        result[name] = {
            'value': B.e(i + 1, 1),
            'SE': SE.e(i + 1, 1),
            'Tstat': Tstat.e(i + 1, 1),
            'Pval': StudT(Tstat.e(i + 1, 1), n - k)
        };
    }
    return result;
}

exports.reg = reg;