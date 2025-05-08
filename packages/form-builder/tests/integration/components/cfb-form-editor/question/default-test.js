import { render } from "@ember/test-helpers";
import { Changeset } from "ember-changeset";
import { hbs } from "ember-cli-htmlbars";
import { module, test } from "qunit";

import { setupRenderingTest } from "dummy/tests/helpers";

module(
  "Integration | Component | cfb-form-editor/question/default",
  function (hooks) {
    setupRenderingTest(hooks);

    test("it renders", async function (assert) {
      this.changeset = new Changeset({
        __typename: "TextQuestion",
        slug: "test",
      });
      this.noop = () => {};

      await render(
        hbs`<CfbFormEditor::Question::Default
  @name="test"
  @model={{this.changeset}}
  @update={{this.noop}}
  @setDirty={{this.noop}}
/>`,
        { owner: this.engine },
      );

      assert.ok(this.element);
    });

    for (const useEdges of [true, false]) {
      test(`it renders a choice question with ${useEdges ? "edges" : "nodes"}`, async function (assert) {
        const fakeNode = (label, slug) => ({
          __typename: "OptionEdge",
          node: {
            __typename: "Option",
            isArchived: false,
            label,
            slug,
          },
        });

        this.edge = {
          node: {
            __typename: "ChoiceQuestion",
            defaultAnswer: null,
            options: {
              __typename: "OptionConnection",
              edges: [fakeNode("label1", "slug1"), fakeNode("label2", "slug2")],
            },
          },
        };
        this.noop = () => {};

        if (!useEdges) {
          this.edge.node.options = this.edge.node.options.edges;
        }

        await render(
          hbs`<CfbFormEditor::Question::Default
    @name="test"
    @model={{changeset this.edge.node}}
    @update={{this.noop}}
    @value={{this.edge.node.defaultAnswer}}
    @setDirty={{this.noop}}
    @disableChoicePowerselectOverride={{true}}
  />`,
          { owner: this.engine },
        );

        assert.ok(this.element);
        const labels = this.element.querySelectorAll("label");
        assert.strictEqual(labels.length, 2);
        assert.strictEqual(labels[0].textContent.trim(), "label1");
        assert.strictEqual(labels[1].textContent.trim(), "label2");

        const radios = this.element.querySelectorAll('input[type="radio"]');
        assert.strictEqual(radios.length, 2);
        assert.strictEqual(radios[0].getAttribute("value"), "slug1");
        assert.strictEqual(radios[1].getAttribute("value"), "slug2");
      });
    }
  },
);
