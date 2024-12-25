const questions = [
    {
        question: "Em que ano foram realizados os Jogos Olímpicos de Paris?",
        options: ["2022", "2024", "2026", "2028"],
        correct: 1
    },
    {
        question: "Qual é o símbolo dos Jogos Olímpicos?",
        options: ["Um arco dourado", "Cinco anéis entrelaçados", "Uma tocha com fogo", "Uma coroa de louros"],
        correct: 1
    },
    {
        question: "Em qual país fica Paris?",
        options: ["Itália", "Alemanha", "França", "Espanha"],
        correct: 2
    },
    {
        question: "Quantos anéis têm o símbolo olímpico?",
        options: ["3", "4", "5", "6"],
        correct: 2
    },
    {
        question: "Qual é a cor do anel central do símbolo olímpico?",
        options: ["Vermelho", "Azul", "Amarelo", "Verde"],
        correct: 1
    },
    {
        question: "Qual é a estação do ano em que os Jogos Olímpicos de Paris 2024 decorreram?",
        options: ["Outono", "Inverno", "Primavera", "Verão"],
        correct: 3
    },
    {
        question: "Qual o desporto que é conhecido por envolver corridas e saltos em pista?",
        options: ["Natação", "Atletismo", "Basquete", "Esgrima"],
        correct: 1
    },
    {
        question: "Qual é a principal lingua falada em Paris?",
        options: ["Inglês", "Espanhol", "Francês", "Alemão"],
        correct: 2
    },
    {
        question: "Quantos dias duram, aproximadamente, os Jogos Olímpicos?",
        options: ["7 dias", "15 dias", "30 dias", "5 dias"],
        correct: 1
    },
    {
        question: "Qual é o nome da mascote oficial dos Jogos Olímpicos de Paris 2024?",
        options: ["Marianne", "Phryge", "Pierre", "Lumière"],
        correct: 1
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
            feedbackDiv.innerText = `Você não respondeu esta pergunta. A resposta correta é: ${q.options[q.correct]}`;
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