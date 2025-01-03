const questions = [
    {
        question: "Quantas vezes Paris sediou os Jogos Olímpicos antes de 2024?",
        options: ["Nenhuma", "Uma vez", "Duas vezes", "Três vezes"],
        correct: 2
    },
    {
        question: "Qual será o local da cerimónia de abertura dos Jogos Olímpicos de Paris 2024?",
        options: ["Estádio de Wembley", "Rio Sena", "Torre Eiffel", "Stade de France"],
        correct: 0
    },
    {
        question: "Qual é o lema oficial dos Jogos Olímpicos?",
        options: ["Mais Rápido, Mais Alto, Mais Forte - Juntos", "Paz e Desporto", "Unidos pelo Desporto", "Um Mundo, Uma Chama"],
        correct: 1
    },
    {
        question: "O skate foi introduzido como modalide olímpico em qual edição dos Jogos Olímpicos? ",
        options: ["Tóquio 2020", "Rio 2016", "Paris 2024", "Pequim 2008"],
        correct: 0
    },
    {
        question: "Qual é o nome do rio que atrevessa a cidade de Paris e será destaque em algumas provas e momentos importantes.",
        options: ["Reno", "Sena", "Danúbio", "Loire"],
        correct: 1
    },
    {
        question: "Quais são os cinco continentes representados pelos anéis olímpicos?",
        options: ["América do Norte, América do Sul, Europa, África e Ásia", "Europa, Ásia, América, África e Oceania", "África, América, Oceania, Ásia e Antártida", "América, Ásia, Europa, África e Ártico"],
        correct: 1
    },
    {
        question: "Quantas medalhas e ouro são geralmente distribuídas nos Jogos Olímpicos de verão?",
        options: ["Aproximadamente 150", "Aproximadamente 300", "Aproximadamente 500", "Aproximadamente 200"],
        correct: 1
    },
    {
        question: "Qual o desporto jogado no campo (ou quadra como é conhecido) com uma bola e dois aros?",
        options: ["Andebol", "Basquetebol", "Voleibol", "Badminton"],
        correct: 1
    },
    {
        question: "Quem pode acender a tocha olímpica na cerimónia de abertura dos Jogos Olímpicos?",
        options: ["Qualquer atleta", "O vencedor da última edição", "Uma pessoa escolhida pelo comité", "O presidente do COI"],
        correct: 2
    },
    {
        question: "Quantos atletas, aproximadamente, participam nos Jogos Olímpicos de Paris 2024?",
        options: ["10 000", "5 000", "15 000", "20 000"],
        correct: 0
    }
];

function loadQuiz() {
    const quizContainer = document.getElementById('quiz');
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.id = `question-${index}`; // ID único para cada questão
        questionDiv.classList.add('mb-4');

        const questionText = document.createElement('h5');
        questionText.innerText = `${index + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);

        q.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('form-check');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${index}`;
            input.value = i;
            input.classList.add('form-check-input');
            optionDiv.appendChild(input);

            const label = document.createElement('label');
            label.innerText = option;
            label.classList.add('form-check-label');
            optionDiv.appendChild(label);

            questionDiv.appendChild(optionDiv);
        });

        quizContainer.appendChild(questionDiv);
    });
}

function submitQuiz() {
    let score = 0;
    questions.forEach((q, index) => {
        const questionDiv = document.getElementById(`question-${index}`);
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        const feedbackDiv = document.createElement('div');
        feedbackDiv.classList.add('mt-2', 'p-2');

        if (selected) {
            if (parseInt(selected.value) === q.correct) {
                score++;
                feedbackDiv.classList.add('correct');
                feedbackDiv.innerText = "Resposta correta!";
            } else {
                feedbackDiv.classList.add('incorrect');
                feedbackDiv.innerText = `Resposta errada. A resposta correta é: ${q.options[q.correct]}`;
            }
        } else {
            feedbackDiv.classList.add('incorrect');
            feedbackDiv.innerText = `Não respondeu esta pergunta. A resposta correta é: ${q.options[q.correct]}`;
        }

        questionDiv.appendChild(feedbackDiv); // Adiciona feedback dentro da questão correspondente
        document.querySelectorAll(`input[name="question-${index}"]`).forEach(input => {
            input.disabled = true;
        });
    });

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `<h4>Você acertou ${score} de ${questions.length} perguntas!</h4>`;
}

window.onload = loadQuiz;