describe('data (option)', () => {
  it('should be null by default', () => {
    const image = window.createImage();
    const cropper = new Cropper(image);
    expect(cropper.options.data).to.be.null;
  });
  it('should match the given data', (done) => {
    const image = window.createImage();
    const initialData = {
      x: 16,
      y: 9,
      width: 160,
      height: 90,
    };
    const cropper = new Cropper(image, {
      data: initialData,
      ready() {
        const data = cropper.getData(true);
        expect(data.x).to.equal(initialData.x);
        expect(data.y).to.equal(initialData.y);
        expect(data.width).to.equal(initialData.width);
        expect(data.height).to.equal(initialData.height);
        done();
      },
    });
    expect(cropper.options.data).to.deep.equal(initialData);
  });
});
