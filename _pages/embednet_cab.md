---
title: "Siddhant Bansal - Word Recognition"
layout: gridlay
excerpt: "Siddhant Bansal: Word Recognition"
sitemap: false
permalink: /embednet_cab/
---

[comment]: Title
<h2 align="center"> Improving Word Recognition using Multiple Hypotheses and Deep Embeddings</h2>
<p>&nbsp;</p>

[comment]: Authors
<p style="text-align: center;">
<a href="https://sid2697.github.io" style="color: #CC0000"> Siddhant Bansal </a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://kris314.github.io/" style="color: #CC0000"> Praveen Krishnan </a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://faculty.iiit.ac.in/~jawahar/index.html" style="color: #CC0000"> C.V. Jawahar </a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</p>
<p style="text-align: center;"><a href="https://www.icpr2020.it/" style="color:#CC0000">ICPR 2020</a></p>

[comment]: Abstract
<h3> Abstract </h3>
<div style="text-align: justify">
We propose to fuse recognition-based and recognition-free approaches for word recognition using learning-based methods. 
For this purpose, results obtained using a text recognizer and deep embeddings (generated using an End2End network) are fused.
To further improve the embeddings, we propose EmbedNet, it uses triplet loss for training and learns an embedding space where the embedding of the word image lies closer to its corresponding text transcription's embedding.
This updated embedding space helps in choosing the correct prediction with higher confidence.
To further improve the accuracy, we propose a plug-and-play module called Confidence based Accuracy Booster (CAB). 
It takes in the confidence scores obtained from the text recognizer and Euclidean distances between the embeddings and generates an updated distance vector.
This vector has lower distance values for the correct words and higher distance values for the incorrect words.
We rigorously evaluate our proposed method systematically on a collection of books that are in the Hindi language.
Our method achieves an absolute improvement of around 10% in terms of word recognition accuracy.
</div>
<p>&nbsp;</p>
<center>
<figure>
		<div id="projectid">
    <img src="{{ site.url }}{{ site.baseurl }}/images/projectpic/EmbedNet_ProcessFlow.jpg" width="900px" />
		</div>
		<br />
    <p>&nbsp;</p>
    <figcaption>
        For generating the textual transcription, we pass the word image through the CRNN and the End2End network (E2E), simultaneously.
        The CRNN generates multiple (K) textual transcriptions for the input image, whereas the E2E network generates the word image's embedding.
        The K textual transcriptions generated by the CRNN are passed through the E2E network to generate their embeddings.
        We pass these embeddings through the EmbedNet proposed in this work.
        The EmbedNet projects the input embedding to an updated Euclidean space, using which we get updated word image embedding and K transcriptions' embedding.
        We calculate the Euclidean distance between the input embedding and each of the K textual transcriptions.
        We then pass the distance values through the novel Confidence based Accuracy Booster (CAB), which uses them and the confidence scores from the CRNN to generate an updated list of Euclidean distance, which helps in selecting the correct prediction.
    </figcaption>
</figure>
</center>

[comment]: Paper
<h3> Paper </h3>

- arXiv: <a href="https://arxiv.org/pdf/2010.14411.pdf" style="color: #CC0000">PDF</a>
- ICPR: <a href="https://ieeexplore.ieee.org/abstract/document/9412417" style="color: #CC0000">IEEE</a>

Please consider citing if you make use of this work and/or the corresponding code:

```
@misc{bansal2020improving,
      title={Improving Word Recognition using Multiple Hypotheses and Deep Embeddings}, 
      author={Siddhant Bansal and Praveen Krishnan and C. V. Jawahar},
      year={2020},
      eprint={2010.14411},
      archivePrefix={arXiv},
      primaryClass={cs.CV}
}
```

[comment]: Code
<h3> Code </h3>
This work is implemented using the <a href="https://pytorch.org/" style="color: #CC0000">pytorch</a> neural network framework.<br>
The code is available on GitHub. Link: <a href="https://github.com/Sid2697/Word-recognition-EmbedNet-CAB">https://github.com/Sid2697/Word-recognition-EmbedNet-CAB</a>

[comment]: Video
<h3> Video </h3>
<center>
<iframe width="900" height="500" src="https://www.youtube.com/embed/T_TYL-_HpbY" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</center>

<p>&nbsp;</p>
<p>&nbsp;</p>
