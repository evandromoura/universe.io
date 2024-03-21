function zoom(scene, objects) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    objects.getChildren().forEach(function(obj) {
        minX = Math.min(minX, obj.x - obj.displayWidth / 2);
        maxX = Math.max(maxX, obj.x + obj.displayWidth / 2);
        minY = Math.min(minY, obj.y - obj.displayHeight / 2);
        maxY = Math.max(maxY, obj.y + obj.displayHeight / 2);
    });

    let centroX = (minX + maxX) / 2;
    let centroY = (minY + maxY) / 2;
    let largura = maxX - minX;
    let altura = maxY - minY;
    let fatorDeMargem = objects.length > 1? 2:10; 
    largura *= fatorDeMargem;
    altura *= fatorDeMargem;
    scene.cameras.main.centerOn(centroX, centroY);

    // Ajustar zoom baseado na maior dimensão para garantir que todos objetos caibam na tela
    let zoomX = scene.cameras.main.width / largura;
    let zoomY = scene.cameras.main.height / altura;
    let zoom = Math.min(zoomX, zoomY);

    scene.cameras.main.setZoom(zoom);
}

