\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{gruppe-11-article}[2022/12/19 v0.1]

\LoadClass{article}

\usepackage[margin=2.5cm,a4paper,ignorehead,headsep=1.2cm]{geometry}
\usepackage[ngerman]{babel}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{graphicx}
\usepackage{lipsum}
\usepackage{lmodern}
\usepackage{tabularx,booktabs}
\usepackage{titlesec}
\usepackage{listings}

\setlength{\parindent}{0pt}
\setlength{\parskip}{1em}

\renewcommand*\familydefault{\sfdefault}
\renewcommand*\sfdefault{phv}

\usepackage{microtype}
\usepackage{setspace}
\setstretch{1.2}

\definecolor{dark}{RGB}{0,0,0}
\definecolor{light}{RGB}{255,255,255}
\definecolor{accent}{RGB}{255,255,255}

\hypersetup{
    colorlinks=true,
    linkcolor=dark,
    filecolor=magenta,
    urlcolor=dark,
}

\urlstyle{same}

\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\leftmark}
\fancyhead[R]{\thepage}

\renewcommand{\headrulewidth}{0.4pt}

\renewcommand{\footrulewidth}{0.4pt}

\renewcommand{\baselinestretch}{1.2}

\setcounter{secnumdepth}{4}
\titleformat{\paragraph}
{\normalfont\normalsize\bfseries}{\theparagraph}{1em}{}
\titlespacing*{\paragraph}{0pt}{3.25ex plus 1ex minus .2ex}{1.5ex plus .2ex}

\definecolor{titlepagecolor}{HTML}{04284e}
\definecolor{namecolor}{HTML}{d43148}

\newcommand{\code}[1]{\texttt{#1}}

\newcommand{\todo}[1]{\textcolor{red}{TODO: #1}}

\newcommand{\codeinline}[1]{\texttt{#1}}

\newcommand{\codeblock}[1]{\texttt{#1}}

\setcounter{tocdepth}{2}

\renewcommand{\contentsname}{Inhaltsverzeichnis}

\titleformat{\section}
{\normalfont\Large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}
{\normalfont\large\bfseries}{\thesubsection}{1em}{}
\titleformat{\subsubsection}
{\normalfont\normalsize\bfseries}{\thesubsubsection}{1em}{}
\titleformat{\paragraph}
{\normalfont\normalsize\bfseries}{\theparagraph}{1em}{}

\newcommand{\sectionbreak}{\clearpage}

\newcommand{\version}[1]{\newcommand{\@version}{#1 }} % version

\renewcommand{\maketitle}{
\begin{titlepage}
    \newgeometry{left=7.5cm}
	\pagecolor{titlepagecolor}
	\noindent
	\includegraphics[width=13.5cm]{../assets/Battle of the Centerländ.jpg}\\[-1em]
	\color{namecolor}
	\makebox[0pt][l]{\rule{1.3\textwidth}{1pt}}
	\color{white}
	\par
	\noindent
	\textbf{\textsf{Universität}} \textcolor{namecolor}{\textsf{Ulm}}
	\vfill
	\noindent
	{\LARGE \textsf{\@title}}\\\\
	{\large \textsf{Battle of the Centerländs}}\\
	{\textsf{- ein Code sie alle zu knächten}}
	\noindent \\\\
	\textsf{Version: \@version - TEAM 11}\\
	\textsf{Softwaregrundprojekt WiSe 2022/23 und SoSe 2023} \\\\
	\textsf{\@author}\\
\end{titlepage}
\restoregeometry
\nopagecolor
}

\lstdefinelanguage{json}
{
    basicstyle=\normalfont\ttfamily,
    numbers=left,
    numberstyle=\scriptsize,
    stepnumber=1,
    numbersep=8pt,
    showstringspaces=false,
    breaklines=true,
    frame=lines,
    backgroundcolor=\color{white},
    literate=
    *{0}{{{\color{red}0}}}{1}
    {1}{{{\color{red}1}}}{1}
    {2}{{{\color{red}2}}}{1}
    {3}{{{\color{red}3}}}{1}
    {4}{{{\color{red}4}}}{1}
    {5}{{{\color{red}5}}}{1}
    {6}{{{\color{red}6}}}{1}
    {7}{{{\color{red}7}}}{1}
    {8}{{{\color{red}8}}}{1}
    {9}{{{\color{red}9}}}{1}
    {:}{{{\color{red}{:}}}}{1}
    {,}{{{\color{red}{,}}}}{1}
    {\{}{{{\color{red}{\{}}}}{1}
    {\}}{{{\color{red}{\}}}}}{1}
    {[}{{{\color{red}{[}}}}{1}
    {]}{{{\color{red}{]}}}}{1},
}


\renewcommand{\emph}{\textbf}

\definecolor{lightgray}{rgb}{.9,.9,.9}
\definecolor{darkgray}{rgb}{.4,.4,.4}
\definecolor{purple}{rgb}{0.65, 0.12, 0.82}

\lstdefinelanguage{JavaScript}{
  keywords={typeof, new, true, false, catch, function, return, null, catch, switch, var, if, in, while, do, else, case, break},
  keywordstyle=\color{blue}\bfseries,
  ndkeywords={class, export, boolean, throw, implements, import, this},
  ndkeywordstyle=\color{darkgray}\bfseries,
  identifierstyle=\color{black},
  sensitive=false,
  comment=[l]{//},
  morecomment=[s]{/*}{*/},
  commentstyle=\color{purple}\ttfamily,
  stringstyle=\color{red}\ttfamily,
  morestring=[b]',
  morestring=[b]"
}

\lstdefinelanguage{TypeScript}
{
  keywords={typeof, new, true, false, catch, function, return, null, catch, switch, var, if, in, while, do, else, case, break},
  keywordstyle=\color{blue}\bfseries,
  ndkeywords={class, export, boolean, throw, implements, import, this},
  ndkeywordstyle=\color{darkgray}\bfseries,
  identifierstyle=\color{black},
  sensitive=false,
  comment=[l]{//},
  morecomment=[s]{/*}{*/},
  commentstyle=\color{purple}\ttfamily,
  stringstyle=\color{red}\ttfamily,
  morestring=[b]',
  morestring=[b]"
}

\newcommand{\enum}[2]{
    \texttt{#1} - \texttt{#2}
}

\newcommand{\var}[1]{\texttt{\textbf{#1}}}

\newcommand{\type}[2]{
    \texttt{#1}: \texttt{#2}
}

\newcommand{\typeWDescription}[3]{
    \texttt{#1}: \texttt{#2} - \texttt{#3}
}

\newcommand{\varWithValue}[2]{\texttt{\textbf{#1}}: #2}

\newcommand{\biggerthen}{\textgreater}
\newcommand{\smallerthen}{\textless}

\newcommand{\functionDeclare}[2]{
    ( #1 ) $\rightarrow$ #2
}

\newcommand{\pipe}{\textbar \hspace{0.5em}}
\newcommand{\OR}{\textbar\textbar \hspace{0.5em}}
\newcommand{\AND}{\&\& \hspace{0.5em}}
\newcommand{\emptyArray}{[ \hspace{0.5em}]}
\newcommand{\emptyObject}{\{ \hspace{0.5em}\}}

\newcommand{\codeRef}[1]{\hyperref[#1]{\codeinline{#1}}}

% \codeRefInline{code}
\newcommand{\codeRefInline}[1]{\hyperref[#1]{\codeinline{#1}}}

% \type{type}{typeType}
\newcommand{\typeType}[2]{\texttt{#1}\textless\texttt{#2}\textgreater}

% \arrayType{type}
\newcommand{\arrayType}[1]{\typeType{Array}{#1}}

% \function{functionName}{params}{returnType}{description}
\newcommand{\function}[4]{
    \texttt{#1} ( #2 ): #3 \\
    - #4
}

\definecolor{linkcolor}{rgb}{0.0, 0.0, 0.5}
\definecolor{urlcolor}{rgb}{0.0, 0.5, 0.5}
\definecolor{magenta}{rgb}{1.0, 0.0, 1.0}
